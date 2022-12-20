import { Inject, Injectable, Logger } from '@nestjs/common';
import { RedisClientType } from 'redis';
import {
  REDIS_CLIENT,
  Transaction,
  DTransactionsQueueKey,
  DTransactionsRepoName,
  RedisKeyExistsException,
} from '../../common';

@Injectable()
export class TransactionsRepository {
  private readonly logger: Logger = new Logger(TransactionsRepository.name);

  constructor(@Inject(REDIS_CLIENT) private readonly redisClient: RedisClientType) {}

  async createTransaction(transaction: Transaction, stakeAddress: string) {
    const DTransactionItemKey = DTransactionsRepoName.concat(':', stakeAddress);

    await this.checkIfKeyAlreadyExist(DTransactionItemKey);

    await this.saveToDatabase(DTransactionItemKey, transaction);

    return {
      stakeAddress,
    };
  }

  private async checkIfKeyAlreadyExist(DTransactionItemKey: string) {
    if (await this.redisClient.json.GET(DTransactionItemKey)) {
      throw new RedisKeyExistsException(`Key '${DTransactionItemKey}' already exists.`);
    }
  }

  private async saveToDatabase(DTransactionItemKey: string, transaction: Transaction) {
    await this.redisClient
      .multi()
      .json.SET(DTransactionItemKey, '$', transaction)
      .RPUSH(DTransactionsQueueKey, DTransactionItemKey)
      .exec();
  }
}
