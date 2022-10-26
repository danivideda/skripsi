import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const PORT = 3333

async function bootstrap() {
  const logger = new Logger('Main (Main.ts)')
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('/v0');
  app.useGlobalPipes(
    new ValidationPipe({ /** Enable validation when using DTO */
      whitelist: true /**  This will whitelist the DTO fields */,
    }),
  );
  await app.listen(PORT);
  logger.log(`Server started on port ${PORT} `)
}
bootstrap();
