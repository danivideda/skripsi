import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AggregateJob } from './jobs/aggregate.job';

@Injectable()
export class CronJobsService {
  private readonly logger = new Logger(CronJobsService.name);

  constructor(private readonly batchJob: AggregateJob) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  async handleAggregateTransactions() {
    return await this.batchJob.aggregateTransactions();
  }
}
