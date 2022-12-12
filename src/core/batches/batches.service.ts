import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import {
  ForbiddenException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
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

  /**
   * TODO:
   * Implements the new inverted-key technique on cron-jobs batches
   */
  async signBatch(body: SignBatchesDto) {
    const { stakeAddressHex, signatureCborHex } = body;

    try {
      const RedisUsersBatchesKey = `Users:Batches:${stakeAddressHex}`;
      const RedisItemBatchKey = await this.redisClient.get(RedisUsersBatchesKey);

      if (!RedisItemBatchKey) {
        throw new InternalServerErrorException();
      }
      const batchItem: any = await this.redisClient.json.get(RedisItemBatchKey);

      // Check if address can sign this batch
      for (const _stakeAddressHex of batchItem.stakeAddressList) {
        if (stakeAddressHex.toString() === _stakeAddressHex.toString())
          throw new UnauthorizedException('Address cannot sign this transaction');
      }

      // Check if address already signed
      for (const _stakeAddressHex of batchItem.signedList) {
        if (stakeAddressHex.toString() === _stakeAddressHex.toString())
          throw new ForbiddenException('Address already signed');
      }

      // Update and insert signature into redis
      const updatedBatchItem = await this.redisClient
        .multi()
        .json.arrAppend(RedisItemBatchKey!, '$.witnessSignatureList', signatureCborHex)
        .json.arrAppend(RedisItemBatchKey!, '$.signedList', stakeAddressHex)
        .exec();

      return this.utilsService.createResponse(HttpStatus.OK, 'Batch signed', updatedBatchItem);
    } catch (error) {
      if (error instanceof ForbiddenException) throw new ForbiddenException(error.message);
      if (error instanceof UnauthorizedException) throw new ForbiddenException(error.message);
      if (error instanceof InternalServerErrorException) throw new InternalServerErrorException();
    }
  }
}
