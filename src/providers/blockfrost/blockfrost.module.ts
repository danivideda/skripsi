import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import type { DynamicModule, Provider } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BLOCKFROST_CLIENT } from '../../common/constants';

@Module({
  imports: [ConfigModule],
})
export class BlockfrostModule {
  public static register(): DynamicModule {
    // Create blockfrost provider
    const blockfrostProvider: Provider = {
      provide: BLOCKFROST_CLIENT,
      useFactory: (config: ConfigService) => {
        return new BlockFrostAPI({
          projectId: config.getOrThrow('BLOCKFROST_API'),
        });
      },
      inject: [ConfigService],
    };

    // The actual module that being returned, alongside with static @Module({..}) at the top
    return {
      module: BlockfrostModule,
      imports: [],
      providers: [blockfrostProvider],
      exports: [blockfrostProvider],
    };
  }
}
