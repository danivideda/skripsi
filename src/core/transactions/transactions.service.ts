import {
  HttpStatus,
  Injectable,
  Logger,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
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
    const logger = this.logger;
    const utils = this.utilsService;
    const { stakeAddress, destinationAddress, utxos, lovelace } = body;
    const transactionsRepository = this.transactionsRepository;

    let createdTransaction;

    try {
      createdTransaction = await transactionsRepository.createTransaction(
        { destinationAddress, utxos, lovelace },
        stakeAddress,
      );
    } catch (error) {
      logger.error(error);
      if (error instanceof RedisKeyExistsError) {
        throw new BadRequestException(error.message);
      } else {
        throw new InternalServerErrorException();
      }
    }

    return utils.createResponse(HttpStatus.CREATED, 'Transaction created', {
      createdTransaction,
    });
  }
}
