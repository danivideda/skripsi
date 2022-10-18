import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class TransactionsService {
  getTxById(txId: string) {
    return { txId };
    // throw new NotFoundException()
  }
}
