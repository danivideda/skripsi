import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RedisClientType } from 'redis';
import { REDIS_CLIENT } from '../common';

@Injectable()
export class CronJobsService {
  private readonly logger = new Logger(CronJobsService.name);

  constructor(@Inject(REDIS_CLIENT) private readonly redisClient: RedisClientType) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleCron() {
    const transactionQueueKey = 'Transactions:Queue';
    const batchesRepoKey = 'Batches:';

    let count = await this.redisClient.lLen(transactionQueueKey);
    let transactionIdList: Array<string> = [];
    let transactionObjList = [];
    let batchedTransaction = new Map();

    if (count < 3) {
      return this.logger.log(`Not enough transaction in Queue. Current: ${count}`);
    }

    transactionIdList = await this.redisClient.lRange(transactionQueueKey, 0, 3);

    transactionIdList.forEach(async (transactionId) => {
      const transactionObj = await this.redisClient
        .multi()
        .json.get(transactionId.toString())
        .json.del(transactionId.toString())
        .lPop(transactionQueueKey)
        .exec();
    });

    this.logger.log(`Cron job handled every 10 seconds: `);
  }
}
