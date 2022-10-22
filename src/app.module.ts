import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TransactionsModule } from './models/transactions/transactions.module';
import { UtilsModule } from './utils/utils.module';

const ENV = process.env.NODE_ENV

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ENV ? `env/.${ENV}.env` : `/.env`
    }),
    TransactionsModule,
    UtilsModule,
  ],
})
export class AppModule {}
