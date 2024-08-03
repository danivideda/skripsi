import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BatchJob } from './jobs/aggregate.job';
import { CronJobsService } from './cron-jobs.service';
import { BlockfrostModule } from '../providers/blockfrost/blockfrost.module';
import { RedisModule } from '../providers/redis/redis.module';

@Module({
  imports: [RedisModule.registerAsync(), BlockfrostModule.register()],
  providers: [CronJobsService, ConfigService, BatchJob],
})
export class CronJobsModule {}
