import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
  constructor(private transactionService: TransactionsService) {}

  @Get(':id')
  async getById(@Param('id') id: string) {
    return await this.transactionService.getTxById(id);
  }
}
