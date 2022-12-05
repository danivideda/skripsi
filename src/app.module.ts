import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TransactionsModule } from './core/transactions/transactions.module';
import { CronJobsModule } from './jobs/cron-jobs.module';
import { UtilsModule } from './utils/utils.module';

const ENV = process.env.NODE_ENV;

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ENV ? `env/.${ENV}.env` : `/.env`,
    }),
    ScheduleModule.forRoot(),
    CronJobsModule,
    TransactionsModule,
    UtilsModule,
  ],
})
export class AppModule {}
