import { Body, Controller, Get, Header, Param, Post } from '@nestjs/common';
import { SendDto, SubmitDto } from './dto';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
  constructor(private transactionService: TransactionsService) {}

  @Get(':id')
  async getById(@Param('id') id: string) {
    // return await this.transactionService.getTransactionById(id);
    return { message: 'deprecated' };
  }

  @Post('send')
  async send(@Body() sendDto: SendDto) {
    return this.transactionService.sendTransaction(sendDto);
  }

  @Post('submit')
  async submit(@Body() submitDto: SubmitDto) {
    return this.transactionService.submitTransaction(submitDto);
  }
}
