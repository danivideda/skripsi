export class RedisKeyExistsError extends Error {
  constructor(message: string = 'Key already exist') {
    super(message);
  }
}
