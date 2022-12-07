import { HttpStatus, Injectable, Logger, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { UtilsService } from 'src/utils/utils.service';
import { RedisKeyExistsError } from 'src/common';
import { SendTransactionDto } from './dto';
import { TransactionsRepository } from './transactions.repository';

@Injectable()
export class TransactionsService {
  private readonly logger: Logger;

  constructor(
    private readonly utilsService: UtilsService,
    private readonly transactionsRepository: TransactionsRepository,
  ) {
    this.logger = new Logger(TransactionsService.name);
  }

  async sendTransaction(body: SendTransactionDto) {
    const { logger, utils, repository } = this.init();
    const { stakeAddressHex, destinationAddressBech32, utxos, lovelace } = body;

    let createdTransaction;

    try {
      createdTransaction = await repository.createTransaction(
        { destinationAddressBech32, utxos, lovelace },
        stakeAddressHex,
      );
    } catch (error) {
      logger.error(error);
      if (error instanceof RedisKeyExistsError) {
        throw new BadRequestException(error.message);
      } else {
        throw new InternalServerErrorException();
      }
    }

    logger.log('Transaction created');
    return utils.createResponse(HttpStatus.CREATED, 'Transaction created', {
      createdTransaction,
    });
  }

  async getTransactionsCount() {
    const { logger, utils, repository } = this.init();

    let transactionsCount;

    try {
      transactionsCount = await repository.getCount();
    } catch (error) {
      throw new InternalServerErrorException();
    }

    logger.log('Get transaction count');

    return utils.createResponse(HttpStatus.OK, 'Get count', {
      transactionsCount,
    });
  }

  private init() {
    return {
      logger: this.logger,
      utils: this.utilsService,
      repository: this.transactionsRepository,
    };
  }
}
