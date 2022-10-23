import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BlockfrostProvider {
  public API: BlockFrostAPI;
  constructor(config: ConfigService) {
    this.API = new BlockFrostAPI({
      projectId: `${config.get('BLOCKFROST_API')}`,
    });
  }
}
