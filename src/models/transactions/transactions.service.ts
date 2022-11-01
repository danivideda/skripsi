import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import * as NestException from '@nestjs/common/exceptions';
import {
  BlockFrostAPI,
  BlockfrostServerError,
} from '@blockfrost/blockfrost-js';
import { UtilsService } from 'src/utils/utils.service';
import { SendDto, SubmitDto } from './dto';
import createSchemas from './db';
import { Client } from 'redis-om';
import { BLOCKFROST_CLIENT, REDIS_CLIENT } from 'src/common/constants';

@Injectable()
export class TransactionsService {
  constructor(
    private utilsService: UtilsService,
    @Inject(BLOCKFROST_CLIENT) private blockfrostClient: BlockFrostAPI,
    @Inject(REDIS_CLIENT) private redisClient: Client,
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

    return utils.createResponse(HttpStatus.OK, transaction);
  }

  async sendTransaction(body: SendDto) {
    const { stakeAddress, destinationAddress, utxos, lovelace } = body;
    const { api, utils } = this.init();

    let blockfrost;
    let newRawTransactionEntity;

    try {
      // blockfrost = await api.network();
      // await redisClient.set('nestjs-send-endpoint', JSON.stringify(body));

      // TODO: Check into Blockfrost and then input raw cborHex into Redis database in JSON

      const redisClient = this.redisClient;
      const rawTransactionRepository = redisClient.fetchRepository(
        createSchemas().rawTransactionSchema,
      );

      await rawTransactionRepository.createIndex();

      newRawTransactionEntity = await rawTransactionRepository.createAndSave({
        destinationAddress,
        utxos,
        lovelace,
        isProcessed: false,
      });
    } catch (error) {
      console.log(error);
      if (error instanceof BlockfrostServerError) {
        throw new NestException.BadRequestException('Blockfrost Error');
      } else {
        throw new NestException.InternalServerErrorException();
      }
    }

    return utils.createResponse(HttpStatus.OK, {
      newRawTransactionEntity,
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

    return utils.createResponse(HttpStatus.OK, { txId, address });
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
