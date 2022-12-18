import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BufferLike } from 'cbor/types/lib/decoder';
import { RedisClientType } from 'redis';
import { UtilsService } from 'src/utils/utils.service';
import { BLOCKFROST_CLIENT, REDIS_CLIENT, DTransactionsQueueKey, Transaction } from 'src/common';

type NetworkParams = {
  minFee: number;
  feePerByte: number;
  maxTxSize: number;
  maxPossibleFee: number;
  timeToLiveSecond: number;
  slotTTL: number;
};

@Injectable()
export class BatchJob {
  private readonly logger = new Logger(BatchJob.name);

  private networkParams: NetworkParams;
  private transactionKeyList: string[];
  private transactionObjList: Transaction[];
  private transactionFullBuffer: Buffer;
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
    const notEnoughTransactionsInQueue = await this.checkIfNotEnoughTransactionsInQueue();
    if (notEnoughTransactionsInQueue) {
      return this.logger.debug(notEnoughTransactionsInQueue.message);
    }

    await this.setNetworkParameters();

    await this.collectTransactionsInQueueFromDatabase();

    await this.buildBatchedTransaction();

    await this.saveToDatabase();
  }

  private async checkIfNotEnoughTransactionsInQueue(): Promise<{ message: string } | null> {
    const transactionCountInQueue: number = await this.redisClient.lLen(DTransactionsQueueKey);
    const batchLimit: number = Number(this.configService.getOrThrow('BATCHED_TRANSACTION_LIMIT'));
    if (transactionCountInQueue < batchLimit) {
      return { message: `Need at least ${batchLimit} in Queue. Current: ${transactionCountInQueue}` };
    }
    return null;
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
    const { minFee, feePerByte, maxPossibleFee, slotTTL } = this.networkParams;

    const transactionBodyDummy = await this.createTxBody(maxPossibleFee);

    const fullTransactionCborBufferDummy = await this.createFullTransactionCborBuffer(
      transactionBodyDummy.transactionBody,
      transactionBodyDummy.witnessSetCount,
    );

    const calculatedFee = await this.calculateFee(fullTransactionCborBufferDummy);

    const transactionBodyR = await this.createTxBody(calculatedFee.feeTotal, calculatedFee.feePerParticipant);

    const fullTransactionCborBufferDummyR = await this.createFullTransactionCborBuffer(
      transactionBodyR.transactionBody,
      transactionBodyR.witnessSetCount,
    );

    // Transaction Body ----
    let transactionBody = new Map();
    let inputs: Array<any> = [];
    let outputs: Array<any> = [];
    let witnessSetCount: number = 0;
    // end ----

    for (const transactionObj of this.transactionObjList) {
      // Deconstruct the RedisCommandRawReply type object
      const destinationAddressBech32 = transactionObj.destinationAddressBech32;
      const utxos = transactionObj.utxos;
      const lovelace = transactionObj.lovelace;

      // Construct the inputs and outputs
      let totalInputLovelace: number = 0;
      let changeAddrListHex: Array<BufferLike> = [];
      for (const item of utxos) {
        const input: Array<any> = (await this.utilsService.decodeCbor(item))[0];
        const output: Array<any> = (await this.utilsService.decodeCbor(item))[1];
        inputs.push(input);

        totalInputLovelace += Number(output[1]);
        changeAddrListHex.push(output[0]);
      }

      outputs.push([this.utilsService.decodeBech32(destinationAddressBech32), Number(lovelace)]);
      outputs.push([changeAddrListHex[changeAddrListHex.length - 1], totalInputLovelace - lovelace]);
      witnessSetCount = witnessSetCount + Number(new Set(changeAddrListHex).size);
    }

    transactionBody.set(0, inputs).set(1, outputs).set(2, maxPossibleFee).set(3, slotTTL);

    // Construct Witnesses dummy
    let witnessList = [];
    for (let i = 0; i < witnessSetCount; i++) {
      const vkey = Buffer.alloc(32, 'vkey-dummy-bytes');
      const signature = Buffer.alloc(64, 'signature-dummy-bytes');
      witnessList.push([vkey, signature]);
    }
    const witnessSetDummy: Map<number, any> = new Map().set(0, witnessList);
    let transactionFullCborHex: Buffer = await this.utilsService.encodeCbor([
      transactionBody,
      witnessSetDummy,
      true,
      null,
    ]);

    // Calculate fees after including the witness set dummy
    const totalFee: number = minFee + feePerByte * transactionFullCborHex.byteLength;
    const calculatedTotalFee: number =
      totalFee % this.transactionKeyList.length == 0
        ? totalFee
        : (Math.trunc(totalFee / this.transactionKeyList.length) + 1) * this.transactionKeyList.length;
    const feePerParticipant: number = Math.trunc(calculatedTotalFee / this.transactionKeyList.length);

    // Repeat creating the Transaction Body set
    transactionBody = new Map();
    inputs = [];
    outputs = [];
    for (const transactionObj of this.transactionObjList) {
      // Deconstruct the RedisCommandRawReply type object
      const destinationAddressBech32: string = transactionObj['destinationAddressBech32'];
      const utxos = transactionObj['utxos'];
      const lovelace = Number(transactionObj['lovelace']);

      // Construct the inputs and outputs
      let totalInputLovelace: number = 0;
      let changeAddrListHex: Array<BufferLike> = [];
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
        totalInputLovelace - lovelace - feePerParticipant,
      ]);
      witnessSetCount = witnessSetCount + Number(new Set(changeAddrListHex).size);
    }

    transactionBody.set(0, inputs).set(1, outputs).set(2, calculatedTotalFee).set(3, slotTTL);
    transactionFullCborHex = await this.utilsService.encodeCbor([transactionBody, {}, true, null]);

    // Create TxID
    const transactionBodyCborHex = await this.utilsService.encodeCbor(transactionBody);
    this.txId = this.utilsService.blake2b256(transactionBodyCborHex);

    this.logger.debug(
      `CborHex Full Transaction: ${transactionFullCborHex.toString('hex')}`,
      `TxId: ${this.txId}`,
      `Max Possible Fee: ${this.networkParams.maxPossibleFee}`,
      `Calculated Total Fee: ${calculatedTotalFee}`,
      `Fee per participant: ${feePerParticipant}`,
    );
  }

  private async createTxBody(feeTotal: number, feePerParticipant?: number) {
    const { slotTTL } = this.networkParams;
    // Transaction Body ----
    let transactionBody = new Map();
    let inputs: Array<any> = [];
    let outputs: Array<any> = [];
    let witnessSetCount: number = 0;
    // end ----

    for (const transactionObj of this.transactionObjList) {
      // Deconstruct the RedisCommandRawReply type object
      const destinationAddressBech32 = transactionObj.destinationAddressBech32;
      const utxos = transactionObj.utxos;
      const lovelace = transactionObj.lovelace;

      // Construct the inputs and outputs
      let totalInputLovelace: number = 0;
      let changeAddrListHex: Array<BufferLike> = [];
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

    transactionBody.set(0, inputs).set(1, outputs).set(2, feeTotal).set(3, slotTTL);

    return {
      transactionBody,
      witnessSetCount,
    };
  }

  private async createFullTransactionCborBuffer(transactionBody: any, witnessSetCount: number) {
    // Construct Witnesses dummy
    let witnessList = [];
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

  private async calculateFee(transactionFullCborHexBuffer: Buffer) {
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

  private async saveToDatabase(): Promise<void> {
    const { timeToLiveSecond } = this.networkParams;
    // Save into Redis
    const stakeAddressList: Array<string> = [];
    for (const transactionKey of this.transactionKeyList) {
      stakeAddressList.push(transactionKey.slice('Transactions:'.length));
    }
    const witnessSignatureList: Array<string> = [];
    const signedList: Array<string> = [];
    const jsonData = {
      stakeAddressList,
      transactionFullCborHex: this.transactionFullBuffer.toString('hex'),
      witnessSignatureList,
      signedList,
    };

    const RedisBatchesKey = `Batches:${this.txId}`;
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
