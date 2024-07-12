import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { BatchesService } from './batches.service';
import { GetBatchDto, SignBatchesDto } from './dto';

@Controller('batches')
export class BatchesController {
  constructor(private batchesService: BatchesService) {}

  @Post('sign')
  @HttpCode(200)
  async sign(@Body() signDto: SignBatchesDto) {
    return await this.batchesService.signBatch(signDto);
  }

  @Post()
  @HttpCode(200)
  async getBatch(@Body() getBatchDto: GetBatchDto) {
    return await this.batchesService.getBatch(getBatchDto);
  }
}
