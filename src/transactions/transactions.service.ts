import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TransactionsService {
  private API: BlockFrostAPI;
  constructor(config: ConfigService) {
    this.API = new BlockFrostAPI({
      projectId: config.get('BLOCKFROST_API').toString(),
    });
  }

  async getTxById(txId: string) {
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
}
