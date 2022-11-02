import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import * as NestException from '@nestjs/common/exceptions';
import {
  BlockFrostAPI,
  BlockfrostServerError,
} from '@blockfrost/blockfrost-js';
import { UtilsService } from 'src/utils/utils.service';
import { SendDto, SubmitDto } from './dto';
import { BLOCKFROST_CLIENT, REDIS_CLIENT } from 'src/common/constants';
import { RedisClientType } from 'redis';
import { RedisKeyExistsError } from 'src/common/error.type';

@Injectable()
export class TransactionsService {
  constructor(
    private utilsService: UtilsService,
    @Inject(BLOCKFROST_CLIENT) private blockfrostClient: BlockFrostAPI,
    @Inject(REDIS_CLIENT) private redisClient: RedisClientType,
  ) {}

  async getTransactionById(txId: string) {
    const { api, utils } = this.init();

    let transaction;

    try {
      transaction = await api.txsUtxos(txId);
    } catch (error) {
      console.log(error);
      throw new NestException.NotFoundException();
    }

    return utils.createResponse(HttpStatus.OK, 'message', transaction);
  }

  async sendTransaction(body: SendDto) {
    const { stakeAddress, destinationAddress, utxos, lovelace } = body;
    const { api, utils } = this.init();
    const logger = new Logger('Send Transaction');
    const redisClient = this.redisClient;
    const RedisJSONKey = `RawTx:${utils.sha256(`${stakeAddress}`)}`;

    let blockfrost;
    let newRawTx;
    let rawTxRepo;
    let redisTransaction;

    try {
      redisTransaction = await redisClient
        .multi()
        .json.SET(
          RedisJSONKey,
          '$',
          {
            destinationAddress,
            utxos,
            lovelace,
          },
          { NX: true },
        )
        .expire(RedisJSONKey, 300)
        .exec();

      if (!redisTransaction[0]) {
        throw new RedisKeyExistsError();
      }
      newRawTx = await redisClient.json.get(RedisJSONKey);
      rawTxRepo = await redisClient.keys('RawTx:*');
    } catch (error) {
      logger.error(error);
      if (error instanceof BlockfrostServerError) {
        throw new NestException.BadRequestException('Blockfrost Error');
      } else if (error instanceof RedisKeyExistsError) {
        throw new NestException.BadRequestException(error.message);
      } else {
        throw new NestException.InternalServerErrorException();
      }
    }

    return utils.createResponse(HttpStatus.CREATED, 'Transaction created', {
      newRawTx,
      rawTxRepo,
      redisTransaction,
      blockfrost,
    });
  }

  async submitTransaction(body: SubmitDto) {
    const { address, cborHex } = body;
    const { api, utils } = this.init();

    let txId;

    try {
      txId = await api.txSubmit(cborHex);
    } catch (error) {
      console.log(error);
      if (error instanceof BlockfrostServerError) {
        throw new NestException.BadRequestException('Blockfrost Error');
      } else {
        throw new NestException.InternalServerErrorException();
      }
    }

    return utils.createResponse(HttpStatus.OK, 'message', { txId, address });
  }

  private init() {
    const api = this.blockfrostClient;
    const utils = this.utilsService;

    return {
      api,
      utils,
    };
  }
}
