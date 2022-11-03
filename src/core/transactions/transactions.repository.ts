import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisClientType } from 'redis';
import { REDIS_CLIENT } from 'src/common';
import { UtilsService } from 'src/utils/utils.service';
import { CreateTransactionData } from './transactions.type';
import { RedisKeyExistsError } from 'src/common';

@Injectable()
export class TransactionsRepository {
  private readonly ttl: number;
  private readonly logger: Logger;

  constructor(
    configService: ConfigService,
    private readonly utilsService: UtilsService,
    @Inject(REDIS_CLIENT) private readonly redisClient: RedisClientType,
  ) {
    this.ttl = parseInt(configService.getOrThrow('TRANSACTIONS_TIME_TO_LIVE'));
    this.logger = new Logger(TransactionsRepository.name);
  }

  async createTransaction(
    transaction: CreateTransactionData,
    stakeAddress: string,
  ) {
    const { redisClient, logger, ttl } = this.init();
    const RedisJSONKey = `Transactions:${this.utilsService.sha256(`${stakeAddress}`)}`;

    const redisTransaction = await redisClient
      .multi()
      .json.SET(RedisJSONKey, '$', transaction, { NX: true })
      .expire(RedisJSONKey, ttl)
      .exec();

    if (!redisTransaction[0]) {
      throw new RedisKeyExistsError(`Key '${RedisJSONKey}' already exists.`);
    }

    const newTransaction = await redisClient.json.get(RedisJSONKey);

    logger.log(`Successfully created ${RedisJSONKey}`);

    return newTransaction;
  }

  async getCount() {
    const { redisClient, logger } = this.init();
    const txsData = await redisClient.keys('Txs:*');
    const count = txsData.length;

    logger.log(`Transactions repo count: ${count}`);

    return count;
  }

  private init() {
    return {
      redisClient: this.redisClient,
      logger: this.logger,
      ttl: this.ttl
    };
  }
}
