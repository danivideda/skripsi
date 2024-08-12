import { Test } from '@nestjs/testing';
import type { CreateTransactionDto } from '../dto';
import { TransactionsController } from '../transactions.controller';
import { TransactionsService } from '../transactions.service';

describe('TransactionsController', () => {
  let controller: TransactionsController;

  const transactionsServiceMock = {
    createTransaction: jest.fn((dto: CreateTransactionDto) => {
      return {
        ...dto,
      };
    }),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [TransactionsService],
    })
      .overrideProvider(TransactionsService)
      .useValue(transactionsServiceMock)
      .compile();

    controller = moduleRef.get(TransactionsController) as TransactionsController;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create create transaction', async () => {
    const dto: CreateTransactionDto = {
      stakeAddressHex: 'stake_test1-random-stake-address',
      destinationAddressBech32: 'addr_test1-random-address',
      utxos: ['cbor-hex-encoded-string'],
      lovelace: 500000000,
    };

    expect(await controller.create(dto)).toEqual(dto);
  });
});
