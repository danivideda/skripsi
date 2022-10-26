import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { BlockfrostServerError } from '@blockfrost/blockfrost-js';
import { BlockfrostProvider } from 'src/providers/blockfrost/blockfrost.provider';
import { RedisProvider } from 'src/providers/redis/redis.provider';
import { UtilsService } from 'src/utils/utils.service';
import { SendDto, SubmitDto } from './dto';

@Injectable()
export class TransactionsService {
  constructor(
    private blockfrostProvider: BlockfrostProvider,
    private redisProvider: RedisProvider,
    private utilsService: UtilsService,
  ) {}

  async getTransactionById(txId: string) {
    const { api, utils } = this.init();
    let transaction;

    try {
      transaction = await api.txsUtxos(txId);
    } catch (error) {
      console.log(error);
      throw new NotFoundException();
    }
    return utils.createResponse(HttpStatus.OK, transaction);
  }

  async sendTransaction(body: SendDto) {
    const { originAddress, destinationAddress, cborHex, lovelace } = body;
    const { api, utils } = this.init();
    const redisClient = await this.initializeDatabase();

    let blockfrost;

    try {
      // TODO: Check into Blockfrost and then input raw cborHex into Redis database in JSON
      blockfrost = await api.network();
      await redisClient.set('nestjs-send-endpoint', JSON.stringify(body));
    } catch (error) {
      console.log(error);
      if (error instanceof BlockfrostServerError) {
        throw new BadRequestException('Blockfrost Error');
      } else {
        throw new InternalServerErrorException();
      }
    }

    return utils.createResponse(HttpStatus.OK, { body, blockfrost });
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
        throw new BadRequestException('Blockfrost Error');
      } else {
        throw new InternalServerErrorException();
      }
    }

    return utils.createResponse(HttpStatus.OK, { txId, address });
  }

  private init() {
    const api = this.blockfrostProvider.API;
    const utils = this.utilsService;

    return {
      api,
      utils,
    };
  }

  private async initializeDatabase() {
    const redisClient = await this.redisProvider.connect();
    return redisClient;
  }
}
