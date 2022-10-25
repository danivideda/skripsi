import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';
import { Client } from 'redis-om';

@Injectable()
export class RedisProvider {
  public redis: RedisClientType;
  constructor(config: ConfigService) {
    this.redis = createClient({
      url: <string>config.get('REDIS_URL')
    })
    this.redis.on('error', (err) => console.log('Redis Client Error', err));
  }

  async connect() {
    await this.redis.connect()
    const client = await new Client().use(this.redis)
    return client;
  }
}
