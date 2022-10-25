import { Module } from '@nestjs/common';
import { BlockfrostProvider } from 'src/providers/blockfrost/blockfrost.provider';
import { RedisProvider } from 'src/providers/redis/redis.provider';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';

@Module({
  controllers: [TransactionsController],
  providers: [TransactionsService, BlockfrostProvider, RedisProvider],
})
export class TransactionsModule {}
