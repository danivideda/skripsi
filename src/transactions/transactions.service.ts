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

  async runExample() {
    try {
      const latestBlock = await this.API.blocksLatest();
      const networkInfo = await this.API.network();
      const latestEpoch = await this.API.epochsLatest();
      const health = await this.API.health();
      const address = await this.API.addresses(
        'addr_test1qrpnfr74pd76808uu3c98g7qsp2t8hdt6h9959z3k9y0asday7uw3etpkz9j700h6walvl326xpskq6x9funyaljmq6qut9cd5',
      );
      const pools = await this.API.pools({ page: 1, count: 10, order: 'asc' });

      return {
        pools,
        address,
        networkInfo,
        latestEpoch,
        latestBlock,
        health,
      };
    } catch (err) {
      console.log('error', err);
    }
  }

  getTxById(txId: string) {
    return { txId };
    // throw new NotFoundException()
  }
}
