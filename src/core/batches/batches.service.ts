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

  async signBatch(body: SignBatchesDto) {
    const { stakeAddressHex, signatureCborHex } = body;
    const batchLimit = Number(this.configService.getOrThrow('BATCHED_TRANSACTION_LIMIT'));

    try {
      const RedisUsersBatchesKey = `Users:Batches:${stakeAddressHex}`;
      const RedisItemBatchKey = await this.redisClient.get(RedisUsersBatchesKey);

      if (!RedisItemBatchKey) {
        throw new InternalServerErrorException();
      }
      const batchItem: any = await this.redisClient.json.get(RedisItemBatchKey);

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
      const updatedBatchStatus: any = await this.redisClient
        .multi()
        .json.arrAppend(RedisItemBatchKey!, '$.witnessSignatureList', signatureCborHex)
        .json.arrAppend(RedisItemBatchKey!, '$.signedList', stakeAddressHex)
        .exec();

      // Stop here if it not all already signed
      if (updatedBatchStatus[0][0] < batchLimit) {
        return this.utilsService.createResponse(HttpStatus.OK, 'Batch signed', updatedBatchStatus);
      }

      // Continue here if all is signed
      const updatedBatchItem: any = await this.redisClient.json.get(RedisItemBatchKey);

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
      this.logger.debug(transactionFullEncoded.toString('hex'));
      const saveToRedis = await this.redisClient.json.set(
        RedisItemBatchKey,
        '$.transactionFullCborHex',
        transactionFullEncoded.toString('hex'),
      );

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
}
