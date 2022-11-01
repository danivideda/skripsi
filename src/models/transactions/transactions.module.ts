import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BlockfrostModule } from 'src/providers/blockfrost/blockfrost.module';
import { RedisModule } from 'src/providers/redis/redis.module';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';

@Module({
  imports: [BlockfrostModule.register(), RedisModule.registerAsync()],
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}
