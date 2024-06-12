import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Main (Main.ts)');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = parseInt(<string>configService.get('PORT'));

  app.setGlobalPrefix('/v0');
  app.enableCors({
    origin: '*',
  });
  app.useGlobalPipes(
    new ValidationPipe({
      /** Enable validation when using DTO */
      whitelist: true /**  This will whitelist the DTO fields */,
    }),
  );
  await app.listen(port);

  logger.log(`Server started on port ${port} `);
}

bootstrap();
