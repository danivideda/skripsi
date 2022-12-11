import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import { Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BufferLike } from 'cbor/types/lib/decoder';
import { RedisClientType, SchemaFieldTypes } from 'redis';
import { UtilsService } from 'src/utils/utils.service';
import { BLOCKFROST_CLIENT, REDIS_CLIENT } from '../common';

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
    const RedisQueueKey = 'Transactions:Queue';
    const transactionCountInQueue = await this.redisClient.lLen(RedisQueueKey);
    const batchLimit = Number(this.configService.getOrThrow('BATCHED_TRANSACTION_LIMIT'));
    if (transactionCountInQueue < Number(this.configService.getOrThrow('BATCHED_TRANSACTION_LIMIT'))) {
      return this.logger.debug(`Need at least ${batchLimit} in Queue. Current: ${transactionCountInQueue}`);
    }

    let transactionIdList: Array<string> = [];
    let transactionObjList: Array<any> = [];

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
    transactionIdList = await this.redisClient.lRange(RedisQueueKey, 0, batchLimit - 1);
    for (const transactionId of transactionIdList) {
      transactionObjList.push(
        (
          await this.redisClient
            .multi()
            .json.get(transactionId.toString())
            .json.del(transactionId.toString())
            .lPop(RedisQueueKey)
            .exec()
        )[0],
      );
    }

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
      totalFee % transactionIdList.length == 0
        ? totalFee
        : (Math.trunc(totalFee / transactionIdList.length) + 1) * transactionIdList.length;
    const feePerParticipant: number = Math.trunc(calculatedTotalFee / transactionIdList.length);

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
    for (const transactionId of transactionIdList) {
      stakeAddressList.push(transactionId.slice('Transactions:'.length, -1));
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
    const setToRedis = await this.redisClient
      .multi()
      .json.SET(RedisBatchesKey, '$', jsonData)
      .expire(RedisBatchesKey, timeToLiveSecond)
      .exec();

    this.logger.debug(
      `CborHex Full Transaction: ${transactionFullCborHex.toString('hex')}`,
      `TxId: ${txId}`,
      `Max Possible Fee: ${maxPossibleFee}`,
      `Calculated Total Fee: ${calculatedTotalFee}`,
      `Fee per participant: ${feePerParticipant}`,
      `Saved to Redis: ${setToRedis}`,
    );
  }
}
