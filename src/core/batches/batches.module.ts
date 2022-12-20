import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BlockfrostModule } from '../../providers/blockfrost/blockfrost.module';
import { RedisModule } from '../../providers/redis/redis.module';
import { BatchesController } from './batches.controller';
import { BatchesService } from './batches.service';

@Module({
  imports: [ConfigModule, BlockfrostModule.register(), RedisModule.registerAsync()],
  providers: [BatchesService],
  controllers: [BatchesController],
})
export class BatchesModule {}
