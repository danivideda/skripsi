import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisClientType } from 'redis';
import { REDIS_CLIENT } from 'src/common';
import { UtilsService } from 'src/utils/utils.service';
import { CreateTransactionData } from './transactions.type';
import { RedisKeyExistsException } from 'src/common';

@Injectable()
export class TransactionsRepository {
  private readonly ttl: number;
  private readonly logger: Logger;
  private readonly repo: string;

  constructor(
    configService: ConfigService,
    private readonly utilsService: UtilsService,
    @Inject(REDIS_CLIENT) private readonly redisClient: RedisClientType,
  ) {
    // this.ttl = parseInt(configService.getOrThrow('TRANSACTIONS_TIME_TO_LIVE'));
    this.logger = new Logger(TransactionsRepository.name);
    this.repo = 'Transactions';
  }

  async createTransaction(transaction: CreateTransactionData, stakeAddress: string) {
    const { redisClient, logger, repo } = this.init();
    const RedisJSONKey = repo.concat(':', stakeAddress);
    const RedisListKey = repo.concat(':Queue');

    if (await redisClient.json.GET(RedisJSONKey)) {
      throw new RedisKeyExistsException(`Key '${RedisJSONKey}' already exists.`);
    }

    await redisClient.multi().json.SET(RedisJSONKey, '$', transaction).RPUSH(RedisListKey, RedisJSONKey).exec();

    const newTransaction = await redisClient.json.GET(RedisJSONKey);

    logger.log(`Successfully created ${RedisJSONKey}`);

    return newTransaction;
  }

  async getCount() {
    const { redisClient, logger, repo } = this.init();
    const RedisListKey = repo.concat(':Queue');
    const count = redisClient.LLEN(RedisListKey);

    logger.log(`${repo} repo count: ${count}`);

    return count;
  }

  private init() {
    return {
      redisClient: this.redisClient,
      logger: this.logger,
      ttl: this.ttl,
      repo: this.repo,
    };
  }
}
