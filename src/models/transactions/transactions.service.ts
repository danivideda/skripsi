import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  BlockFrostAPI,
  BlockfrostServerError,
} from '@blockfrost/blockfrost-js';
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

  async submitTransaction(body: SubmitDto) {
    const api = this.blockforstApi;
    const utils = this.utilsService;
    const { address, cborHex } = body;
    let txId;

    try {
      txId = await api.txSubmit(cborHex);
    } catch (error) {
      if (
        error instanceof BlockfrostServerError &&
        error.message.includes('transaction submit error')
      ) {
        console.log(error);
        throw new BadRequestException('transaction submit error');
      } else {
        throw new InternalServerErrorException();
      }
    }

    return utils.createResponse(HttpStatus.OK, { txId, address });
  }
}
