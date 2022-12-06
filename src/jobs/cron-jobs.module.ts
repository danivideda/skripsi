import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BlockfrostModule } from 'src/providers/blockfrost/blockfrost.module';
import { RedisModule } from 'src/providers/redis/redis.module';
import { CronJobsService } from './cron-jobs.service';

@Module({
  imports: [RedisModule.registerAsync(), BlockfrostModule.register()],
  providers: [CronJobsService, ConfigService],
})
export class CronJobsModule {}
