import { ConfigService } from '@nestjs/config';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { RedisClientType } from 'redis';
import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import type { Transaction } from '../../common';
import {
  REDIS_CLIENT,
  BLOCKFROST_CLIENT,
  DTransactionsQueueKey,
  DTransactionsRepoName,
  DBatchesRepoName,
} from '../../common';
import { UtilsService } from '../../utils/utils.service';
import type { BufferLike } from 'cbor/types/lib/decoder';

type NetworkParams = {
  minFee: number;
  feePerByte: number;
  maxTxSize: number;
  maxPossibleFee: number;
  timeToLiveSecond: number;
  slotTTL: number;
};

type TxBodyMap = Map<any, any>;

@Injectable()
export class BatchJob {
  private readonly logger = new Logger(BatchJob.name);

  private networkParams: NetworkParams;
  private transactionKeyList: string[] = [];
  private transactionObjList: Transaction[] = [];
  private transactionFullCborBuffer: Buffer;
  private txId: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly utilsService: UtilsService,
    @Inject(REDIS_CLIENT) private readonly redisClient: RedisClientType,
    @Inject(BLOCKFROST_CLIENT) private readonly blockfrostClient: BlockFrostAPI,
  ) {}

  /**
   * Batch multiple transactions into one transaction
   */
  async batchTransactions() {
    try {
      const notEnoughTransactionsInQueue = await this.checkIfNotEnoughTransactionsInQueue();
      if (notEnoughTransactionsInQueue) {
        return this.logger.log(notEnoughTransactionsInQueue.message);
      }

      await this.setNetworkParameters();

      await this.collectTransactionsInQueueFromDatabase();

      await this.buildBatchedTransaction();

      await this.saveToDatabase();

      return this.logger.log('Batched.');
    } catch (error) {
      this.logger.error(error);
    }
  }

  private async checkIfNotEnoughTransactionsInQueue(): Promise<{ message: string } | null> {
    const transactionCountInQueue: number = await this.redisClient.lLen(DTransactionsQueueKey);
    const batchLimit = Number(this.configService.getOrThrow('BATCHED_TRANSACTION_LIMIT'));
    if (transactionCountInQueue < batchLimit) {
      return { message: `Need at least ${batchLimit} in Queue. Current: ${transactionCountInQueue}` };
    }
    return null;
  }

  private async setNetworkParameters(): Promise<void> {
    // Set parameters for TxBody
    const latestEpoch = (await this.blockfrostClient.epochsLatest()).epoch;
    const latestEpochParameters = await this.blockfrostClient.epochsParameters(latestEpoch);
    const minFee = Number(latestEpochParameters.min_fee_b);
    const feePerByte = Number(latestEpochParameters.min_fee_a);
    const maxTxSize = Number(latestEpochParameters.max_tx_size);
    const maxPossibleFee = minFee + feePerByte * maxTxSize;
    const timeToLiveSecond = Number(this.configService.getOrThrow('TRANSACTIONS_TIME_TO_LIVE'));
    const slotTTL = timeToLiveSecond + Number((await this.blockfrostClient.blocksLatest()).slot);

    this.networkParams = {
      minFee,
      feePerByte,
      maxTxSize,
      maxPossibleFee,
      timeToLiveSecond,
      slotTTL,
    };
  }

  private async collectTransactionsInQueueFromDatabase(): Promise<void> {
    // Collect Transaction object from Redis
    this.transactionKeyList = await this.redisClient.lRange(
      DTransactionsQueueKey,
      0,
      Number(this.configService.getOrThrow('BATCHED_TRANSACTION_LIMIT')) - 1,
    );

    for (const transactionKey of this.transactionKeyList) {
      const obj: unknown = (
        await this.redisClient
          .multi()
          .json.get(transactionKey.toString())
          .json.del(transactionKey.toString())
          .lPop(DTransactionsQueueKey)
          .exec()
      )[0];

      this.transactionObjList.push(obj as Transaction);
    }
  }

  private async buildBatchedTransaction(): Promise<void> {
    const { maxPossibleFee } = this.networkParams;

    const { transactionBody: txBodyDummy, witnessSetCount: witnessSetCountDummy } = await this.createTxBody(
      maxPossibleFee,
    );

    const fullTransactionCborBufferDummy = await this.createFullTransactionCborBuffer(
      txBodyDummy,
      witnessSetCountDummy,
    );

    const { feeTotal, feePerParticipant } = await this.calculateFee(fullTransactionCborBufferDummy);

    const { transactionBody: txBody, witnessSetCount: witnessSetCount } = await this.createTxBody(
      feeTotal,
      feePerParticipant,
    );

    this.transactionFullCborBuffer = await this.createFullTransactionCborBuffer(txBody, witnessSetCount);

    // Create TxID
    await this.createTxId(txBody);

    this.logger.debug(
      // `CborHex Full Transaction: ${this.transactionFullCborBuffer.toString('hex')}`,
      `TxId: ${this.txId}`,
      `Max Possible Fee: ${this.networkParams.maxPossibleFee}`,
      `Calculated Total Fee: ${feeTotal}`,
      `Fee per participant: ${feePerParticipant}`,
    );
  }

  private async createTxBody(feeTotal: number, feePerParticipant?: number) {
    const { slotTTL } = this.networkParams;
    // Transaction Body ----
    const transactionBody = new Map();
    const inputs: Array<any> = [];
    const outputs: Array<any> = [];
    let witnessSetCount = 0;
    // end ----

    for (const transactionObj of this.transactionObjList) {
      // Deconstruct the RedisCommandRawReply type object
      const destinationAddressBech32 = transactionObj.destinationAddressBech32;
      const utxos = transactionObj.utxos;
      const lovelace = transactionObj.lovelace;

      // Construct the inputs and outputs
      let totalInputLovelace = 0;
      const changeAddrListHex: Array<BufferLike> = [];
      for (const item of utxos) {
        const input: Array<any> = (await this.utilsService.decodeCbor(item))[0];
        const output: Array<any> = (await this.utilsService.decodeCbor(item))[1];
        inputs.push(input);

        totalInputLovelace += Number(output[1]);
        changeAddrListHex.push(output[0]);
      }

      outputs.push([this.utilsService.decodeBech32(destinationAddressBech32), Number(lovelace)]);
      outputs.push([
        changeAddrListHex[changeAddrListHex.length - 1],
        totalInputLovelace - lovelace - (feePerParticipant ?? 0),
      ]);
      witnessSetCount = witnessSetCount + Number(new Set(changeAddrListHex).size);
    }

    this.logger.debug(`TxBody: ${transactionBody}`, `Fee per participant: ${feePerParticipant}`);

    transactionBody.set(0, inputs).set(1, outputs).set(2, feeTotal).set(3, slotTTL);

    return {
      transactionBody,
      witnessSetCount,
    };
  }

  private async createFullTransactionCborBuffer(transactionBody: TxBodyMap, witnessSetCount: number) {
    // Construct Witnesses dummy
    const witnessList = [];
    for (let i = 0; i < witnessSetCount; i++) {
      const vkey = Buffer.alloc(32, 'vkey-dummy-bytes');
      const signature = Buffer.alloc(64, 'signature-dummy-bytes');
      witnessList.push([vkey, signature]);
    }
    const witnessSetDummy: Map<number, any> = new Map().set(0, witnessList);
    const transactionFullCborBuffer: Buffer = await this.utilsService.encodeCbor([
      transactionBody,
      witnessSetDummy,
      true,
      null,
    ]);

    return transactionFullCborBuffer;
  }

  private async calculateFee(
    transactionFullCborHexBuffer: Buffer,
  ): Promise<{ feeTotal: number; feePerParticipant: number }> {
    const { minFee, feePerByte } = this.networkParams;
    // Calculate fees after including the witness set dummy
    const rawFeeTotal: number = minFee + feePerByte * transactionFullCborHexBuffer.byteLength;
    const feeTotal: number =
      rawFeeTotal % this.transactionKeyList.length == 0
        ? rawFeeTotal
        : (Math.trunc(rawFeeTotal / this.transactionKeyList.length) + 1) * this.transactionKeyList.length;
    const feePerParticipant: number = Math.trunc(feeTotal / this.transactionKeyList.length);

    return { feeTotal, feePerParticipant };
  }

  private async createTxId(transactionBody: TxBodyMap): Promise<void> {
    const transactionBodyCborBuffer = await this.utilsService.encodeCbor(transactionBody);
    this.txId = this.utilsService.blake2b256(transactionBodyCborBuffer);
  }

  private async saveToDatabase(): Promise<void> {
    const { timeToLiveSecond } = this.networkParams;
    // Save into Redis
    const stakeAddressList: Array<string> = [];
    for (const transactionKey of this.transactionKeyList) {
      stakeAddressList.push(transactionKey.slice(`${DTransactionsRepoName}:`.length));
    }
    const witnessSignatureList: Array<string> = [];
    const signedList: Array<string> = [];
    const jsonData = {
      stakeAddressList,
      transactionFullCborHex: this.transactionFullCborBuffer.toString('hex'),
      witnessSignatureList,
      signedList,
    };

    const RedisBatchesKey = `${DBatchesRepoName}:${this.txId}`;
    const redisQuery = this.redisClient
      .multi()
      .json.SET(RedisBatchesKey, '$', jsonData)
      .expire(RedisBatchesKey, timeToLiveSecond);

    for (const transactionKey of this.transactionKeyList) {
      const RedisUsersKey = 'Users:Batches:' + transactionKey.slice('Transactions:'.length);
      redisQuery.set(RedisUsersKey, RedisBatchesKey).expire(RedisUsersKey, timeToLiveSecond);
    }

    const saveToRedis = await redisQuery.exec();

    this.logger.debug(`Saved to Redis: ${saveToRedis}`);
  }
}
