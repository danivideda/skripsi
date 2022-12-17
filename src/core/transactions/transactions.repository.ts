import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisClientType } from 'redis';
import { REDIS_CLIENT, Transaction } from 'src/common';
import { RedisKeyExistsException } from 'src/common';

@Injectable()
export class TransactionsRepository {
  private readonly ttl: number;
  private readonly logger: Logger;
  private readonly repo: string;

  constructor(configService: ConfigService, @Inject(REDIS_CLIENT) private readonly redisClient: RedisClientType) {
    // this.ttl = parseInt(configService.getOrThrow('TRANSACTIONS_TIME_TO_LIVE'));
    this.logger = new Logger(TransactionsRepository.name);
    this.repo = 'Transactions';
  }

  async createTransaction(transaction: Transaction, stakeAddress: string) {
    const RedisJSONKey = this.repo.concat(':', stakeAddress);
    const RedisListKey = this.repo.concat(':Queue');

    if (await this.redisClient.json.GET(RedisJSONKey)) {
      throw new RedisKeyExistsException(`Key '${RedisJSONKey}' already exists.`);
    }

    await this.redisClient.multi().json.SET(RedisJSONKey, '$', transaction).RPUSH(RedisListKey, RedisJSONKey).exec();

    const newTransaction = await this.redisClient.json.GET(RedisJSONKey);

    this.logger.log(`Successfully created ${RedisJSONKey}`);

    return newTransaction;
  }
}
