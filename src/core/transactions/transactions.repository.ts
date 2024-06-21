import { Inject, Injectable, Logger } from '@nestjs/common';
import { RedisClientType } from 'redis';
import type { Transaction } from '../../common';
import { REDIS_CLIENT, DTransactionsQueueKey, DTransactionsRepoName, RedisKeyExistsException } from '../../common';

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

  async checkIfTransactionAlreadyInQueue(stakeAddressHex: string) {
    const DTransactionItemKey = DTransactionsRepoName.concat(':', stakeAddressHex);

    await this.checkIfKeyAlreadyExist(DTransactionItemKey);
  }

  async getTransactionListInQueue() {
    const queueList = await this.redisClient.LRANGE(DTransactionsQueueKey, 0, 20);
    const populated = await Promise.all(
      queueList.map(async (item) => {
        const parsedItem = JSON.parse((await this.redisClient.GET(item)) as string);
        return { stakeAddress: item.replace(DTransactionsRepoName + ':', ''), ...parsedItem };
      }),
    );

    return {
      queue_list: populated,
    };
  }

  private async checkIfKeyAlreadyExist(DTransactionsItemKey: string) {
    if (await this.redisClient.GET(DTransactionsItemKey)) {
      throw new RedisKeyExistsException(`Key '${DTransactionsItemKey}' already exists.`);
    }
  }

  private async saveToDatabase(DTransactionsItemKey: string, transaction: Transaction) {
    await this.redisClient
      .multi()
      .SET(DTransactionsItemKey, JSON.stringify(transaction))
      .RPUSH(DTransactionsQueueKey, DTransactionsItemKey)
      .exec();
  }
}
