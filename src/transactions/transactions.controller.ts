import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
  constructor(private transactionService: TransactionsService) {}

  @Get(':id')
  async getById(@Param('id') id: string) {
    // Get transaction from the service. Error is handled by the service
    const transaction = await this.transactionService.getTxById(id);

    const response = {
      statusCode: HttpStatus.OK,
      data: transaction,
    };

    return response;
  }
}
