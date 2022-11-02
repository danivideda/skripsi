import { HttpStatus, Injectable } from '@nestjs/common';
import * as cbor from 'cbor';
import { createHash } from 'crypto';

@Injectable()
export class UtilsService {
  public readonly cbor = cbor;

  createResponse(statusCode: HttpStatus, message: string, data: any) {
    return {
      statusCode,
      message,
      data,
    };
  }

  sha256(payload: string) {
    return createHash('sha256').update(payload).digest('base64url')
  }
}
