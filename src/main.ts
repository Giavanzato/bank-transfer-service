import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Globale DTO-Validierung aktivieren
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Swagger/OpenAPI Setup
  const config = new DocumentBuilder()
    .setTitle('Bank Transfer Service')
    .setDescription('API-Dokumentation aller Endpunkte')
    .setVersion('1.0')
    // .addBearerAuth() // falls du JWT-Bearer-Security nutzen möchtest
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📖 Swagger UI available on http://localhost:${port}/api`);
}

bootstrap();
