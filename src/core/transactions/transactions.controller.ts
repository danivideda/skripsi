import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CreateTransactionDto, GetStatusDTO } from './dto';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
  constructor(private transactionService: TransactionsService) {}

  @Post('create')
  async create(@Body() createTransactionDto: CreateTransactionDto) {
    return await this.transactionService.createTransaction(createTransactionDto);
  }

  @Get('queue')
  @HttpCode(HttpStatus.OK)
  async queueList() {
    return await this.transactionService.getQueueList();
  }

  @Post('status')
  @HttpCode(HttpStatus.OK)
  async getStatus(@Body() getStatusDto: GetStatusDTO) {
    return await this.transactionService.getStatus(getStatusDto);
  }
}
