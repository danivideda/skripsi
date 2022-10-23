import { HttpStatus, Injectable } from '@nestjs/common';
import * as cbor from 'cbor';

@Injectable()
export class UtilsService {
  public cbor = cbor;

  createResponse(statusCode: HttpStatus, data: any) {
    return {
      statusCode,
      data,
    };
  }
}
