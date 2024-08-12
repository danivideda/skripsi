import { Test } from '@nestjs/testing';
import { UtilsService } from '../../../utils/utils.service';
import { TransactionsRepository } from '../transactions.repository';
import { TransactionsService } from '../transactions.service';

describe('TransactionsService', () => {
  let service: TransactionsService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [TransactionsService, UtilsService, TransactionsRepository],
    })
      .overrideProvider(UtilsService)
      .useValue({})
      .overrideProvider(TransactionsRepository)
      .useValue({})
      .compile();
    service = moduleRef.get(TransactionsService) as TransactionsService;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
