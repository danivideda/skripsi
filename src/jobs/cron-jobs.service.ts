import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BufferLike } from 'cbor/types/lib/decoder';
import { RedisClientType } from 'redis';
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
      return this.logger.verbose(`Need at least ${batchLimit} in Queue. Current: ${transactionCountInQueue}`);
    }

    let transactionIdList: Array<string> = [];

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
      const transactionObj = (
        await this.redisClient
          .multi()
          .json.get(transactionId.toString())
          .json.del(transactionId.toString())
          .lPop(RedisQueueKey)
          .exec()
      )[0];

      // Deconstruct the RedisCommandRawReply type object
      const destinationAddressBech32: string = <string>(
        (<unknown>transactionObj?.['destinationAddressBech32' as keyof typeof transactionObj])
      );
      const utxos = <Array<any>>(<unknown>transactionObj?.['utxos' as keyof typeof transactionObj]);
      const lovelace = Number(transactionObj?.['lovelace' as keyof typeof transactionObj]);

      // Construct the inputs and outputs
      let totalInputLovelace: number = 0;
      let changeAddrListHex: Array<BufferLike> = [];
      for (const item of utxos) {
        const input: Array<any> = (await this.utilsService.decodeCbor(item?.toString() as keyof BufferLike))[0];
        const output: Array<any> = (await this.utilsService.decodeCbor(item?.toString() as keyof BufferLike))[1];
        inputs.push(input);

        totalInputLovelace += Number(output[1]);
        changeAddrListHex.push(output[0]);
      }

      outputs.push([this.utilsService.decodeBech32(destinationAddressBech32!.toString()), Number(lovelace)]);
      outputs.push([changeAddrListHex[changeAddrListHex.length - 1], totalInputLovelace - lovelace]);
      witnessSetCount = witnessSetCount + Number(new Set(changeAddrListHex).size);
    }

    transactionBody.set(0, inputs).set(1, outputs).set(2, maxPossibleFee).set(3, slotTTL);

    // Construct Witnesses dummy
    const witnessSetDummy = new Map().set(0, []);
    let witnessList = [];
    for (let i = 0; i < witnessSetCount; i++) {
      const vkey = Buffer.alloc(32);
      const signature = Buffer.alloc(64);
      witnessList.push([vkey, signature]);
    }
    const transactionFullCborHex: Buffer = await this.utilsService.encodeCbor([
      transactionBody,
      witnessSetDummy,
      true,
      null,
    ]);

    this.logger.verbose(
      `Batched every 10 seconds: ${transactionFullCborHex.toString('hex')}`,
      `Max possible fee: ${maxPossibleFee}`,
    );

    /** TODO
     * 1. Create TxID of the batched TxQ - DONE -
     * 2. Save into Redis
     * 3. Calculate fee when all participants already signed the Tx
     */

    // Create TxID
    const transactionBodyCborHex = await this.utilsService.encodeCbor(transactionBody);
    const txId = this.utilsService.blake2b256(transactionBodyCborHex);

    // Save into Redis
    const addressList: Array<string> = [];
    for (const transactionId of transactionIdList) {
      addressList.push(transactionId.slice('Transactions:'.length - 1, -1));
    }
    const jsonData = {
      transactionFullCborHex: transactionFullCborHex.toString('hex'),
      addressList,
    };
    const RedisBatchesKey = `Batches:${txId}`;
    const setToRedis = await this.redisClient
      .multi()
      .json.SET(RedisBatchesKey, '$', jsonData)
      .expire(RedisBatchesKey, timeToLiveSecond)
      .exec();

    this.logger.verbose(
      `CborHex of only TxBody: ${transactionBodyCborHex.toString('hex')}`,
      `TxId: ${txId}`,
      `Saved to Redis: ${setToRedis}`,
    );
  }
}
