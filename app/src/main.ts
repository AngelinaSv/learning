import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const config = new DocumentBuilder()
    .setTitle('File Storage API')
    .setDescription('API documentation for file storage system')
    .setVersion('1.0')
    .addTag('auth')
    .addTag('users')
    .addTag('files')
    .addTag('storage')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3009, '0.0.0.0');
}
void bootstrap();
