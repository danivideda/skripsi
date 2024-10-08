import { Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisClientType } from 'redis';
import {
  REDIS_CLIENT,
  DTransactionsRepoName,
  DUsersBatchesRepoName,
  DTransactionsQueueKey,
} from '../../common/constants';
import { RedisKeyExistsException } from '../../common/exceptions';
import type { Transaction, WalletStatus } from '../../common/types';

@Injectable()
export class TransactionsRepository {
  private readonly logger: Logger = new Logger(TransactionsRepository.name);

  constructor(
    @Inject(REDIS_CLIENT) private readonly redisClient: RedisClientType,
    private readonly configService: ConfigService,
  ) {}

  async createTransaction(transaction: Transaction, stakeAddress: string) {
    const DTransactionItemKey = DTransactionsRepoName.concat(':', stakeAddress);

    await this.checkIfKeyAlreadyExist(DTransactionItemKey);

    await this.saveToDatabaseQueue(DTransactionItemKey, transaction);

    return {
      stakeAddress,
    };
  }

  async getTransactionStatus(stakeAddressHex: string): Promise<WalletStatus> {
    // in_batch
    // signed
    const RedisUsersBatchesKey = `${DUsersBatchesRepoName}:${stakeAddressHex}`;
    const usersBatchesItem = await this.redisClient.GET(RedisUsersBatchesKey);
    // this.logger.log(usersBatchesItem, stakeAddressHex);
    if (usersBatchesItem) {
      const RedisBatchesKey: string = usersBatchesItem;
      const batchesItem = await this.redisClient.GET(RedisBatchesKey);
      if (!batchesItem) {
        throw new InternalServerErrorException();
      }

      const alreadySignedList: Array<string> = JSON.parse(batchesItem).signedList;
      if (alreadySignedList.includes(stakeAddressHex)) {
        return 'signed';
      }
      return 'in_batch';
    }

    // in_queue
    const RedisTransactionKey = `${DTransactionsRepoName}:${stakeAddressHex}`;
    const transactionItem = await this.redisClient.GET(RedisTransactionKey);
    if (transactionItem) {
      return 'in_queue';
    }

    // available
    return 'available';
  }

  async getTransactionListInQueue() {
    const queueList = await this.redisClient.LRANGE(DTransactionsQueueKey, 0, -1);
    const populated = await Promise.all(
      queueList.map(async (item) => {
        const parsedItem = JSON.parse((await this.redisClient.GET(item)) as string);
        return { stakeAddress: item.replace(DTransactionsRepoName + ':', ''), ...parsedItem };
      }),
    );
    const batchLimit = Number(this.configService.getOrThrow('BATCHED_TRANSACTION_LIMIT'));

    return {
      queue_list: populated,
      aggregation_count: batchLimit,
    };
  }

  private async checkIfKeyAlreadyExist(RedisTransactionKey: string) {
    if (await this.redisClient.GET(RedisTransactionKey)) {
      throw new RedisKeyExistsException(`Key '${RedisTransactionKey}' already exists.`);
    }
  }

  private async saveToDatabaseQueue(DTransactionsItemKey: string, transaction: Transaction) {
    await this.redisClient
      .multi()
      .SET(DTransactionsItemKey, JSON.stringify(transaction))
      .RPUSH(DTransactionsQueueKey, DTransactionsItemKey)
      .exec();
  }
}
