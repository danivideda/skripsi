import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BufferLike } from 'cbor/types/lib/decoder';
import { RedisClientType } from 'redis';
import { UtilsService } from 'src/utils/utils.service';
import { BLOCKFROST_CLIENT, REDIS_CLIENT, TransactionsQueueKey, TransactionType } from 'src/common';

@Injectable()
export class CronJobsService {
  private readonly logger = new Logger(CronJobsService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly utilsService: UtilsService,
    @Inject(REDIS_CLIENT) private readonly redisClient: RedisClientType,
    @Inject(BLOCKFROST_CLIENT) private readonly blockfrostClient: BlockFrostAPI,
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleCron() {
    checkIfEnoughItemInQueue();

    let transactionKeyList: string[] = [];
    let transactionObjList: TransactionType[] = [];

    // Transaction Body ----
    const latestEpoch = (await this.blockfrostClient.epochsLatest()).epoch;
    const latestEpochParameters = await this.blockfrostClient.epochsParameters(latestEpoch);
    const minFee = Number(latestEpochParameters.min_fee_b);
    const feePerByte = Number(latestEpochParameters.min_fee_a);
    const maxTxSize = Number(latestEpochParameters.max_tx_size);
    const maxPossibleFee = minFee + feePerByte * maxTxSize;
    const timeToLiveSecond = Number(this.configService.getOrThrow('TRANSACTIONS_TIME_TO_LIVE'));
    const slotTTL: Number = timeToLiveSecond + Number((await this.blockfrostClient.blocksLatest()).slot);

    let transactionBody = new Map();
    let inputs: Array<any> = [];
    let outputs: Array<any> = [];
    let witnessSetCount: number = 0;
    // end ----

    // Collect Transaction object from Redis
    transactionKeyList = await this.redisClient.lRange(
      TransactionsQueueKey,
      0,
      Number(this.configService.getOrThrow('BATCHED_TRANSACTION_LIMIT')) - 1,
    );
    for (const transactionKey of transactionKeyList) {
      const obj: unknown = (
        await this.redisClient
          .multi()
          .json.get(transactionKey.toString())
          .json.del(transactionKey.toString())
          .lPop(TransactionsQueueKey)
          .exec()
      )[0];
      transactionObjList.push(obj as TransactionType);
    }

    for (const transactionObj of transactionObjList) {
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
      totalFee % transactionKeyList.length == 0
        ? totalFee
        : (Math.trunc(totalFee / transactionKeyList.length) + 1) * transactionKeyList.length;
    const feePerParticipant: number = Math.trunc(calculatedTotalFee / transactionKeyList.length);

    // Repeat creating the Transaction Body set
    transactionBody = new Map();
    inputs = [];
    outputs = [];
    for (const transactionObj of transactionObjList) {
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
    const txId = this.utilsService.blake2b256(transactionBodyCborHex);

    // Save into Redis
    const stakeAddressList: Array<string> = [];
    for (const transactionKey of transactionKeyList) {
      stakeAddressList.push(transactionKey.slice('Transactions:'.length));
    }
    const witnessSignatureList: Array<string> = [];
    const signedList: Array<string> = [];
    const jsonData = {
      stakeAddressList,
      transactionFullCborHex: transactionFullCborHex.toString('hex'),
      witnessSignatureList,
      signedList,
    };

    const RedisBatchesKey = `Batches:${txId}`;
    const redisQuery = this.redisClient
      .multi()
      .json.SET(RedisBatchesKey, '$', jsonData)
      .expire(RedisBatchesKey, timeToLiveSecond);

    for (const transactionKey of transactionKeyList) {
      const RedisUsersKey = 'Users:Batches:' + transactionKey.slice('Transactions:'.length);
      redisQuery.set(RedisUsersKey, RedisBatchesKey).expire(RedisUsersKey, timeToLiveSecond);
    }

    const saveToRedis = await redisQuery.exec();

    this.logger.debug(
      `CborHex Full Transaction: ${transactionFullCborHex.toString('hex')}`,
      `TxId: ${txId}`,
      `Max Possible Fee: ${maxPossibleFee}`,
      `Calculated Total Fee: ${calculatedTotalFee}`,
      `Fee per participant: ${feePerParticipant}`,
      `Saved to Redis: ${saveToRedis}`,
    );

    async function checkIfEnoughItemInQueue(): Promise<void> {
      const transactionCountInQueue = await this.redisClient.lLen(TransactionsQueueKey);
      const batchLimit = Number(this.configService.getOrThrow('BATCHED_TRANSACTION_LIMIT'));
      if (transactionCountInQueue < Number(this.configService.getOrThrow('BATCHED_TRANSACTION_LIMIT'))) {
        return this.logger.debug(`Need at least ${batchLimit} in Queue. Current: ${transactionCountInQueue}`);
      }
    }
  }
}
