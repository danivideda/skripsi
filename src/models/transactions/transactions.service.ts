import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import { BlockfrostProvider } from 'src/providers/blockfrost/blockfrost.provider';
import { UtilsService } from 'src/utils/utils.service';
import { SendDto, SubmitDto } from './dto';

@Injectable()
export class TransactionsService {
  private blockforstApi: BlockFrostAPI;

  constructor(
    provider: BlockfrostProvider,
    private utilsService: UtilsService,
  ) {
    this.blockforstApi = provider.API;
  }

  async getTransactionById(txId: string) {
    const api = this.blockforstApi;
    const utils = this.utilsService;
    let transaction;

    try {
      transaction = await api.txsUtxos(txId);
    } catch (error) {
      console.log(error);
      throw new NotFoundException();
    }
    return utils.createResponse(HttpStatus.OK, transaction);
  }

  async sendTransaction(data: SendDto) {
    const api = this.blockforstApi;
    const utils = this.utilsService;
    let transaction;

    return utils.createResponse(HttpStatus.OK, data);
  }

  async submitTransaction(data: SubmitDto) {
    const response = {
      statusCode: HttpStatus.OK,
      data: data,
    };

    return response;
  }
}
