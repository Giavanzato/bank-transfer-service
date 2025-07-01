import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

// Importiere deine globalen Hilfsklassen

import { GlobalApiExceptionFilter } from './common/filters/global-api-exception.filter';
import { ApiResponseInterceptor } from './common/interceptors/api-response.interceptors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Globale DTO-Validierung aktivieren
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // → Globale API-Response Wrapper
  app.useGlobalInterceptors(new ApiResponseInterceptor());

  // → Globale Fehlerbehandlung im einheitlichen Format
  app.useGlobalFilters(new GlobalApiExceptionFilter());

  // Swagger/OpenAPI Setup
  const config = new DocumentBuilder()
    .setTitle('Bank Transfer Service')
    .setDescription('API-Dokumentation aller Endpunkte')
    .setVersion('1.0')
    // .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📖 Swagger UI available on http://localhost:${port}/api`);
}

bootstrap();
