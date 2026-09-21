import { INestApplication, ValidationPipe } from '@nestjs/common';
import { env } from './config/env.js';

export function configureApp(app: INestApplication) {
  app.enableCors({ origin: env.CORS_ORIGIN });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
}
