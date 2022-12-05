import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RedisClientType } from 'redis';
import { REDIS_CLIENT } from '../common';

@Injectable()
export class CronJobsService {
  private readonly logger = new Logger(CronJobsService.name);

  constructor(
    @Inject(REDIS_CLIENT) private readonly redisClient: RedisClientType,
  ) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  async handleCron() {
    const transaction = await this.redisClient.json.GET(
      'Transactions:stake_test1qra6ryfvycs4gf0wa42qak5rvv2rs8u85ru76zgganmwptp0d5dxpdatxft8ka436d8z4765fvacmdcxv7kjss08sg8q08scm7',
    );

    this.logger.log('Cron job handled every 5 second: ', transaction);
  }
}
