export class RedisKeyExistsException extends Error {
  constructor(message = 'Key already exist') {
    super(message);
  }
}
