import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CheckQueueDTO, CreateTransactionDto } from './dto';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
  constructor(private transactionService: TransactionsService) {}

  @Post('create')
  async create(@Body() createTransactionDto: CreateTransactionDto) {
    return await this.transactionService.createTransaction(createTransactionDto);
  }

  @Post('queue/check')
  @HttpCode(HttpStatus.OK)
  async queue(@Body() checkQueueDto: CheckQueueDTO) {
    return await this.transactionService.checkQueue(checkQueueDto);
  }
}
