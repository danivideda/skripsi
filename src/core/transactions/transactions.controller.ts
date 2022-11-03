import { Body, Controller, Post } from '@nestjs/common';
import { SendTransactionDto } from './dto';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
  constructor(private transactionService: TransactionsService) {}

  @Post('send')
  async send(@Body() sendDto: SendTransactionDto) {
    return this.transactionService.sendTransaction(sendDto);
  }
}
