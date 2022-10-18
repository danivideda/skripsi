import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import { Injectable, NotFoundException } from '@nestjs/common';
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
    try {
      const transaction = await this.API.txsUtxos(txId);
      return transaction;
    } catch (error) {
      console.log(error);
      throw new NotFoundException();
    }
  }
}
