import { Module } from "@nestjs/common";
import { RedisModule } from "src/providers/redis/redis.module";
import { CronJobsService } from "./cron-jobs.service";

@Module({
  imports: [RedisModule.registerAsync()],
  providers: [CronJobsService]
})
export class CronJobsModule {}