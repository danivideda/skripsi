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
import { REDIS_CLIENT, BLOCKFROST_CLIENT, DBatchesRepoName } from '../../common/constants';
import type { Batch } from '../../common/types';
import { UtilsService } from '../../utils/utils.service';
import type { GetBatchDto, SignBatchesDto } from './dto';

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
    const batchLimit = Number(this.configService.getOrThrow('BATCHED_TRANSACTION_LIMIT'));

    try {
      const RedisUsersBatchesKey = `Users:Batches:${stakeAddressHex}`;
      const RedisItemBatchKey = await this.redisClient.get(RedisUsersBatchesKey);

      if (!RedisItemBatchKey) {
        throw new InternalServerErrorException();
      }
      const batchItemJsonString = await this.redisClient.GET(RedisItemBatchKey);
      if (!batchItemJsonString) {
        throw new InternalServerErrorException();
      }

      const batchItem: Batch = JSON.parse(batchItemJsonString);

      // Check if address can sign this batch
      if (!batchItem.stakeAddressList.includes(stakeAddressHex)) {
        throw new UnauthorizedException('Address cannot sign this transaction');
      }

      // Check if address already signed
      for (const _stakeAddressHex of batchItem.signedList) {
        if (stakeAddressHex.toString() === _stakeAddressHex.toString())
          throw new ForbiddenException('Address already signed');
      }

      // Update and insert signature into redis
      batchItem.witnessSignatureList.push(signatureCborHex);
      batchItem.signedList.push(stakeAddressHex);
      const updatedBatchStatus: any = await this.redisClient.SET(RedisItemBatchKey, JSON.stringify(batchItem));

      // Stop here if it not all already signed
      if (updatedBatchStatus[0][0] < batchLimit) {
        return this.utilsService.createResponse(HttpStatus.OK, 'Batch signed', updatedBatchStatus);
      }

      // Continue here if all is signed
      const updatedBatchItemJsonString = await this.redisClient.GET(RedisItemBatchKey);
      if (!updatedBatchItemJsonString) {
        throw new InternalServerErrorException();
      }

      const updatedBatchItem: Batch = JSON.parse(updatedBatchItemJsonString);

      // Collect signatures to a single array
      const allSignatureList = [];
      for (const signatureListCborHex of updatedBatchItem.witnessSignatureList) {
        const signatureListObj: Array<any> = (await this.utilsService.decodeCbor(signatureListCborHex)).get(0);
        for (const signatureCborHex of signatureListObj) {
          allSignatureList.push(signatureCborHex);
        }
      }

      // Insert to Cbor
      const transactionFullCborHex = updatedBatchItem.transactionFullCborHex;
      const transactionFullObj = await this.utilsService.decodeCbor(transactionFullCborHex);
      transactionFullObj[1] = new Map().set(0, allSignatureList);

      // Send to redis
      const transactionFullEncoded = await this.utilsService.encodeCbor(transactionFullObj);
      updatedBatchItem.transactionFullCborHex = transactionFullEncoded.toString('hex');
      this.logger.debug(transactionFullEncoded.toString('hex'));
      const saveToRedis = await this.redisClient.SET(RedisItemBatchKey, JSON.stringify(updatedBatchItem));

      this.logger.debug(
        `Saved to redis: ${saveToRedis}`,
        `Transaction full: ${transactionFullEncoded.toString('hex')}`,
      );

      return this.utilsService.createResponse(HttpStatus.CREATED, 'Successfully signed all participants.', {
        txId: RedisItemBatchKey.slice('Batches:'.length),
      });
    } catch (error) {
      console.log(error);
      if (error instanceof ForbiddenException) throw new ForbiddenException(error.message);
      if (error instanceof UnauthorizedException) throw new ForbiddenException(error.message);
      throw new InternalServerErrorException();
    }
  }

  async getBatch(body: GetBatchDto) {
    const { stakeAddressHex } = body;
    const RedisUsersBatchesItemKey = `${DBatchesRepoName}:${stakeAddressHex}`;
    return 'hello';
  }
}
