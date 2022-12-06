import { HttpStatus, Injectable } from '@nestjs/common';
import { bech32 } from 'bech32';
import * as cbor from 'cbor';
import { BufferLike } from 'cbor/types/lib/decoder';
import { createHash } from 'crypto';

@Injectable()
export class UtilsService {
  private readonly cbor = cbor;

  createResponse(statusCode: HttpStatus, message: string, data: any) {
    return {
      statusCode,
      message,
      data,
    };
  }

  sha256(payload: string) {
    return createHash('sha256').update(payload).digest('base64url');
  }

  async decodeCbor(cbor: BufferLike) {
    const decoded = await this.cbor.decodeFirst(cbor);
    return decoded;
  }

  async encodeCbor(payload: any) {
    const encoded = await cbor.encodeAsync(payload);
    return encoded;
  }

  encodeBech32(prefix: string, payload: string) {
    let words = bech32.toWords(Buffer.from(payload, 'hex'));
    // The 1023 characters limit is the recommended maximum length, as per the docs says: https://npm.io/package/bech32
    return bech32.encode(prefix, words, 1023);
  }

  decodeBech32(encoded: string) {
    // The 1023 characters limit is the recommended maximum length, as per the docs says: https://npm.io/package/bech32
    let decoded = bech32.decode(encoded, 1023);
    return Buffer.from(bech32.fromWords(decoded.words));
  }
}
