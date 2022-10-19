import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { TransactionsModule } from './transactions/transactions.module';
import { UtilsModule } from './utils/utils.module';

@Module({
  imports: [
    TransactionsModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UtilsModule,
  ],
})
export class AppModule {}
