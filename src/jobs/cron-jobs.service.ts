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
    const transactionQueueKey = 'Transactions:Queue';
    const count = await this.redisClient.lLen(transactionQueueKey);
    if (count < 3) {
      return this.logger.log(`Not enough transaction in Queue. Current: ${count}`);
    }

    const batchesRepoKey = 'Batches:';
    let transactionIdList: Array<string> = [];
    let transactionObjList = [];

    // Transaction Body ----
    const latestEpoch = (await this.blockfrostClient.epochsLatest()).epoch;
    const latestEpochParameters = await this.blockfrostClient.epochsParameters(latestEpoch);
    const minFee = Number(latestEpochParameters.min_fee_b);
    const feePerByte = Number(latestEpochParameters.min_fee_b);
    const maxTxSize = Number(latestEpochParameters.max_tx_size);
    const maxPossibleFee = minFee + feePerByte * maxTxSize;
    const slotTTL: Number =
      Number(this.configService.getOrThrow('TRANSACTIONS_TIME_TO_LIVE')) +
      Number((await this.blockfrostClient.blocksLatest()).slot);

    let transactionBody = new Map();
    let inputs: Array<any> = [];
    let outputs: Array<any> = [];
    let calculatedFee: number = 0;
    // end ----

    // Collect Transaction object from Redis
    transactionIdList = await this.redisClient.lRange(transactionQueueKey, 0, 2);
    transactionIdList.forEach(async (transactionId, index) => {
      const transactionObj = (
        await this.redisClient
          .multi()
          .json.get(transactionId.toString())
          .json.del(transactionId.toString())
          .lPop(transactionQueueKey)
          .exec()
      )[0];

      // Deconstruct the RedisCommandRawReply type object
      const destinationAddressBech32 =
        transactionObj?.['destinationAddressBech32' as keyof typeof transactionObj];
      const utxos = new Array(transactionObj?.['utxos' as keyof typeof transactionObj]);
      const lovelace = Number(transactionObj?.['lovelace' as keyof typeof transactionObj]);

      // Construct the inputs and outputs
      let totalInputLovelace: number = 0;
      let changeAddressHex: BufferLike = '';
      let inputs: any
      utxos.forEach(async (item, index) => {
        const input = (await this.utilsService.decodeCbor(item?.toString() as keyof BufferLike))[0];
        const output = (
          await this.utilsService.decodeCbor(item?.toString() as keyof BufferLike)
        )[1];
        inputs.push(input);

        this.logger.debug(`Inputs: ${inputs.length == 0}`);
        console.log(inputs);

        totalInputLovelace += Number(output[1]);
        changeAddressHex = output[0];
      });

      outputs.push([
        this.utilsService.decodeBech32(destinationAddressBech32!.toString()),
        Number(lovelace),
      ]);
      outputs.push([changeAddressHex, totalInputLovelace - lovelace]);
    });

    let cborHex: Buffer;

    transactionBody.set(0, inputs).set(1, outputs).set(2, maxPossibleFee).set(3, slotTTL);
    cborHex = await this.utilsService.encodeCbor(transactionBody);

    calculatedFee = minFee + feePerByte * Number(cborHex.byteLength);
    transactionBody.set(0, inputs).set(1, outputs).set(2, calculatedFee).set(3, slotTTL);
    cborHex = await this.utilsService.encodeCbor(transactionBody);

    this.logger.log(`Cron job handled every 10 seconds: ${cborHex.toString()}`);
    console.log(transactionBody);
  }
}
