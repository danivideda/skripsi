import { Body, Controller, Get, Post } from '@nestjs/common';
import { SendTransactionDto } from './dto';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
  constructor(private transactionService: TransactionsService) {}

  @Post('send')
  async send(@Body() sendDto: SendTransactionDto) {
    return await this.transactionService.sendTransaction(sendDto);
  }

  @Get('count')
  async getTransactionsCount() {
    return await this.transactionService.getTransactionsCount();
  }
}
