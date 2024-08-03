import { ConfigService } from '@nestjs/config';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { RedisClientType } from 'redis';
import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import { UtilsService } from '../../utils/utils.service';
import type { BufferLike } from 'cbor/types/lib/decoder';
import {
  REDIS_CLIENT,
  BLOCKFROST_CLIENT,
  DTransactionsQueueKey,
  DTransactionsRepoName,
  DBatchesRepoName,
  DUsersBatchesRepoName,
} from '../../common/constants';
import type { Transaction } from '../../common/types';

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
export class AggregateJob {
  private readonly logger = new Logger(AggregateJob.name);

  private networkParams: NetworkParams;
  private transactionKeyList: string[];
  private transactionObjList: Transaction[];
  private transactionFullCborBuffer: Buffer;
  private txId: string;
  private feeTotal: number;
  private feePerParticipant: number;
  private totalInputUtxoCount: number;
  private txByteSize: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly utilsService: UtilsService,
    @Inject(REDIS_CLIENT) private readonly redisClient: RedisClientType,
    @Inject(BLOCKFROST_CLIENT) private readonly blockfrostClient: BlockFrostAPI,
  ) {}

  /**
   * Aggregate multiple transactions into one transaction
   */
  async aggregateTransactions() {
    this.networkParams = {} as NetworkParams;
    this.transactionKeyList = [];
    this.transactionObjList = [];
    this.transactionFullCborBuffer = Buffer.alloc(0, 'empty');
    this.txId = '';

    try {
      const enoughTransactionInQueue = await this.enoughTransactionInQueue();
      if (!enoughTransactionInQueue.passed) {
        return this.logger.log(enoughTransactionInQueue.message);
      }
      await this.collectTransactionsInQueueFromDatabase();
      await this.setNetworkParameters();
      await this.buildBatchedTransaction();
      await this.saveToDatabase();

      return this.logger.log('Aggregated.');
    } catch (error) {
      this.logger.error(error);
    }
  }

  private async enoughTransactionInQueue(): Promise<{ passed: boolean; message?: string }> {
    const transactionCountInQueue: number = await this.redisClient.lLen(DTransactionsQueueKey);
    const batchLimit = Number(this.configService.getOrThrow('BATCHED_TRANSACTION_LIMIT'));
    if (transactionCountInQueue < batchLimit) {
      return { passed: false, message: `Need at least ${batchLimit} in Queue. Current: ${transactionCountInQueue}` };
    }
    return { passed: true };
  }

  private async collectTransactionsInQueueFromDatabase(): Promise<void> {
    this.transactionKeyList = await this.redisClient.LRANGE(
      DTransactionsQueueKey,
      0,
      Number(this.configService.getOrThrow('BATCHED_TRANSACTION_LIMIT')) - 1,
    );

    for (const transactionKey of this.transactionKeyList) {
      const jsonString: unknown = (
        await this.redisClient.multi().GET(transactionKey).DEL(transactionKey).LPOP(DTransactionsQueueKey).exec()
      )[0];

      const obj: Transaction = JSON.parse(jsonString as string);

      this.transactionObjList.push(obj);
    }
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
      outputs.push([changeAddrListHex[0], totalInputLovelace - lovelace - (feePerParticipant ?? 0)]);

      const changeAddrListHexString = [];
      for (const item of changeAddrListHex) {
        changeAddrListHexString.push(item.toString('hex'));
      }
      witnessSetCount = witnessSetCount + Number(new Set(changeAddrListHexString).size);
      this.logger.debug(`Witness set count: ${witnessSetCount}`, changeAddrListHexString);
    }

    transactionBody.set(0, inputs).set(1, outputs).set(2, feeTotal).set(3, slotTTL);

    this.totalInputUtxoCount = inputs.length;

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
    const txByteSize = transactionFullCborHexBuffer.byteLength;
    const rawFeeTotal: number = minFee + feePerByte * txByteSize;
    const feeTotal: number =
      rawFeeTotal % this.transactionKeyList.length == 0
        ? rawFeeTotal
        : (Math.trunc(rawFeeTotal / this.transactionKeyList.length) + 1) * this.transactionKeyList.length;
    const feePerParticipant: number = Math.trunc(feeTotal / this.transactionKeyList.length);

    this.feeTotal = feeTotal;
    this.feePerParticipant = feePerParticipant;
    this.txByteSize = txByteSize;

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
      feeTotal: this.feeTotal,
      feePerParticipant: this.feePerParticipant,
      totalInputUtxoCount: this.totalInputUtxoCount,
      txByteSize: this.txByteSize,
    };

    const RedisBatchesKey = `${DBatchesRepoName}:${this.txId}`;
    const redisQuery = this.redisClient
      .multi()
      .SET(RedisBatchesKey, JSON.stringify(jsonData))
      .expire(RedisBatchesKey, timeToLiveSecond);

    for (const transactionKey of this.transactionKeyList) {
      const RedisUsersBatchesKey = `${DUsersBatchesRepoName}:${transactionKey.slice('Transactions:'.length)}`;
      redisQuery.set(RedisUsersBatchesKey, RedisBatchesKey).expire(RedisUsersBatchesKey, timeToLiveSecond);
    }

    const saveToRedis = await redisQuery.exec();

    this.logger.debug(`Saved to Redis: ${saveToRedis}`);
  }
}
