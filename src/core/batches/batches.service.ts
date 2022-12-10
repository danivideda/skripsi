import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import { HttpStatus, Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisClientType } from 'redis';
import { BLOCKFROST_CLIENT, REDIS_CLIENT } from 'src/common';
import { UtilsService } from 'src/utils/utils.service';
import { SignBatchesDto } from './dto';

@Injectable()
export class BatchesService {
  private readonly logger = new Logger(BatchesService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly utilsService: UtilsService,
    @Inject(REDIS_CLIENT) private readonly redisClient: RedisClientType,
    @Inject(BLOCKFROST_CLIENT) private readonly blockfrostClient: BlockFrostAPI,
  ) {}

  async signBatch(body: SignBatchesDto) {
    const { stakeAddressHex, signatureCborHex } = body;

    try {
      const batchItem = await this.redisClient.ft.search('idx:batches', `@stakeAddressList:{${stakeAddressHex}}`);
      this.logger.debug(JSON.stringify(batchItem));

      this.utilsService.createResponse(HttpStatus.OK, 'Batch signed', JSON.stringify(batchItem));
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
