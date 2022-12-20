import { Test } from '@nestjs/testing';
import { TransactionsController } from '../transactions.controller';
import { TransactionsService } from '../transactions.service';

describe('TransactionsController', () => {
  let transactionsController: TransactionsController;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [TransactionsService],
    })
      .overrideProvider(TransactionsService)
      .useValue({})
      .compile();

    transactionsController = moduleRef.get(TransactionsController) as TransactionsController;
  });

  it('should be defined', () => {
    expect(transactionsController).toBeDefined();
  });
});
