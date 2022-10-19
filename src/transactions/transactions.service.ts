import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SendDto, SubmitDto } from './dto';

@Injectable()
export class TransactionsService {
  private API: BlockFrostAPI;
  constructor(config: ConfigService) {
    this.API = new BlockFrostAPI({
      projectId: `${config.get('BLOCKFROST_API')}`,
    });
  }

  async getTransactionById(txId: string) {
    let transaction;
    try {
      transaction = await this.API.txsUtxos(txId);
    } catch (error) {
      console.log(error);
      throw new NotFoundException();
    }

    const response = {
      statusCode: HttpStatus.OK,
      data: transaction,
    };

    return response;
  }

  async sendTransaction(data: SendDto) {
    const response = {
      statusCode: HttpStatus.OK,
      data: data,
    };

    return response;
  }

  async submitTransaction(data: SubmitDto) {
    const response = {
      statusCode: HttpStatus.OK,
      data: data,
    };

    return response;
  }
}
