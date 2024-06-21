import { HttpStatus, Injectable, Logger, InternalServerErrorException, ForbiddenException } from '@nestjs/common';
import type { Transaction } from '../../common';
import { RedisKeyExistsException } from '../../common';
import { UtilsService } from '../../utils/utils.service';
import type { CheckQueueDTO, CreateTransactionDto } from './dto';
import { TransactionsRepository } from './transactions.repository';

@Injectable()
export class TransactionsService {
  private readonly logger: Logger = new Logger(TransactionsService.name);

  constructor(
    private readonly utilsService: UtilsService,
    private readonly transactionsRepository: TransactionsRepository,
  ) {}

  async createTransaction(body: CreateTransactionDto) {
    const { stakeAddressHex, destinationAddressBech32, utxos, lovelace } = body;

    let createdTransaction;

    try {
      const transaction: Transaction = { destinationAddressBech32, utxos, lovelace };
      createdTransaction = await this.transactionsRepository.createTransaction(transaction, stakeAddressHex);
    } catch (error) {
      this.logger.error(error);
      if (error instanceof RedisKeyExistsException) {
        throw new ForbiddenException('Already in queue');
      } else {
        throw new InternalServerErrorException();
      }
    }

    this.logger.log('Transaction created');
    return this.utilsService.createResponse(HttpStatus.CREATED, 'Transaction created', {
      createdTransaction,
    });
  }

  async checkQueue(body: CheckQueueDTO) {
    try {
      await this.transactionsRepository.checkIfTransactionAlreadyInQueue(body.stakeAddressHex);

      return this.utilsService.createResponse(HttpStatus.OK, 'Not in queue');
    } catch (error) {
      this.logger.error(error);
      if (error instanceof RedisKeyExistsException) {
        return this.utilsService.createResponse(HttpStatus.OK, 'Already in queue');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async getQueueList() {
    return await this.transactionsRepository.getTransactionListInQueue();
  }
}
