import { Controller, Get, NotFoundException, Param, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
  constructor(private transactionService: TransactionsService) {}

  @Get(':id')
  getById(@Param('id') id: string) {
    // return this.transactionService.getTxById(id);
    return this.transactionService.runExample()
  }
}
