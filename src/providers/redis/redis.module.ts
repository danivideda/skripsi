import { DynamicModule, Logger, Module, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createClient } from 'redis';
import { Client } from 'redis-om';
import { REDIS_CLIENT } from 'src/common/constants';

@Module({
  imports: [ConfigModule]
})
export class RedisModule {
  public static async registerAsync(): Promise<DynamicModule> {
    // Create async provider for Redis Provider
    const redisProvider: Provider = {
      provide: REDIS_CLIENT,
      useFactory: async (config: ConfigService) => {
        const logger = new Logger('Redis Provider');
        const redis = createClient({
          url: config.getOrThrow('REDIS_URL'),
        });

        redis.on('error', (err) => logger.error(err));
        redis.on('connect', () => logger.log('Redis Client connected'));

        await redis.connect();
        const client = await new Client().use(redis);
        return client;
      },
      inject: [ConfigService],
    };

    // The actual module that being returned, alongside with static @Module({..}) at the top
    return {
      module: RedisModule,
      imports: [],
      providers: [redisProvider],
      exports: [redisProvider],
    };
  }
}
