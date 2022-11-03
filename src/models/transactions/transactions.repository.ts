import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisClientType } from 'redis';
import { REDIS_CLIENT } from 'src/common';
import { UtilsService } from 'src/utils/utils.service';
import { CreateTransactionData } from './transactions.type';
import { RedisKeyExistsError } from 'src/common';
import * as NestException from '@nestjs/common/exceptions';

@Injectable()
export class TransactionsRepository {
  private readonly ttl: number;
  private readonly logger = new Logger(TransactionsRepository.name);

  constructor(
    private readonly configService: ConfigService,
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
    const RedisJSONKey = `RawTx:${this.utilsService.sha256(`${stakeAddress}`)}`;

    let newRawTx;

    try {
      const redisTransaction = await redisClient
        .multi()
        .json.SET(RedisJSONKey, '$', transaction, { NX: true })
        .expire(RedisJSONKey, this.ttl)
        .exec();

      if (!redisTransaction[0]) {
        throw new RedisKeyExistsError();
      }

      newRawTx = await redisClient.json.get(RedisJSONKey);
    } catch (error) {
      logger.error(error);
      if (error instanceof RedisKeyExistsError) {
        throw new NestException.BadRequestException(error.message);
      } else {
        throw new NestException.InternalServerErrorException();
      }
    }

    return newRawTx;
  }
}
