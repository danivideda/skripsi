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
  private readonly logger = new Logger(TransactionsRepository.name);

  constructor(
    configService: ConfigService,
    private readonly utilsService: UtilsService,
    @Inject(REDIS_CLIENT) private readonly redisClient: RedisClientType,
  ) {
    this.ttl = parseInt(configService.getOrThrow('TRANSACTIONS_TIME_TO_LIVE'));
  }

  async createTransaction(
    transaction: CreateTransactionData,
    stakeAddress: string,
  ) {
    const redisClient = this.redisClient;
    const logger = this.logger;
    const RedisJSONKey = `Txs:${this.utilsService.sha256(`${stakeAddress}`)}`;

    let newTransaction;

    const redisTransaction = await redisClient
      .multi()
      .json.SET(RedisJSONKey, '$', transaction, { NX: true })
      .expire(RedisJSONKey, this.ttl)
      .exec();

    if (!redisTransaction[0]) {
      throw new RedisKeyExistsError(`Key '${RedisJSONKey}' already exists.`);
    }

    newTransaction = await redisClient.json.get(RedisJSONKey);

    logger.log(
      `Successfully created ${RedisJSONKey}`,
    );

    return newTransaction;
  }
}
