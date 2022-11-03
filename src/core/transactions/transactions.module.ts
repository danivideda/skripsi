import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BlockfrostModule } from 'src/providers/blockfrost/blockfrost.module';
import { RedisModule } from 'src/providers/redis/redis.module';
import { TransactionsController } from './transactions.controller';
import { TransactionsRepository } from './transactions.repository';
import { TransactionsService } from './transactions.service';

@Module({
  imports: [ConfigModule, BlockfrostModule.register(), RedisModule.registerAsync()],
  controllers: [TransactionsController],
  providers: [TransactionsService, TransactionsRepository],
})
export class TransactionsModule {}
