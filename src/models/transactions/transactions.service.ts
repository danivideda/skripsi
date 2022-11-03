import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import * as NestException from '@nestjs/common/exceptions';
import { RedisClientType } from 'redis';
import {
  BlockFrostAPI,
  BlockfrostServerError,
} from '@blockfrost/blockfrost-js';
import { UtilsService } from 'src/utils/utils.service';
import { BLOCKFROST_CLIENT, REDIS_CLIENT } from 'src/common';
import { SendDto, SubmitDto } from './dto';
import { TransactionsRepository } from './transactions.repository';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly utilsService: UtilsService,
    private readonly transactionsRepository: TransactionsRepository,
    @Inject(BLOCKFROST_CLIENT) private blockfrostClient: BlockFrostAPI,
  ) {}

  async sendTransaction(body: SendDto) {
    const { stakeAddress, destinationAddress, utxos, lovelace } = body;
    const transactionsRepository = this.transactionsRepository;
    const utils = this.utilsService;

    const createdRawTx = await transactionsRepository.createTransaction(
      { destinationAddress, utxos, lovelace },
      stakeAddress,
    );

    return utils.createResponse(HttpStatus.CREATED, 'Transaction created', {
      createdRawTx,
    });
  }

  async submitTransaction(body: SubmitDto) {
    const { address, cborHex } = body;
    const utils = this.utilsService;
    const api = this.blockfrostClient;

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
}
