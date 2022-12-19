import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BatchJob } from './jobs/batch.job';

@Injectable()
export class CronJobsService {
  private readonly logger = new Logger(CronJobsService.name);

  constructor(private readonly batchJob: BatchJob) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleBatchTransactions() {
    return await this.batchJob.batchTransactions();
  }
}
