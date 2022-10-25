import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('/v0');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true /* This will whitelist the DTO fields */,
    }),
  );
  await app.listen(3333);
}
bootstrap();
