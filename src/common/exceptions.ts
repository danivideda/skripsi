export class RedisKeyExistsException extends Error {
  constructor(message: string = 'Key already exist') {
    super(message);
  }
}
