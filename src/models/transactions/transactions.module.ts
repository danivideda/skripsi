import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BlockfrostProvider } from 'src/providers/blockfrost/blockfrost.provider';
import { RedisProvider } from 'src/providers/redis/redis.provider';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';

@Module({
  controllers: [TransactionsController],
  providers: [
    TransactionsService,
    ConfigService,
    BlockfrostProvider,
    RedisProvider,
  ],
})
export class TransactionsModule {}
