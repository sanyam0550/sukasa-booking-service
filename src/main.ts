import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable global validation for DTOs
  app.useGlobalPipes(new ValidationPipe());

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Sukasa Air API')
    .setDescription('API documentation for the Sukasa Air application')
    .setVersion('1.0')
    .addBearerAuth() // Enables Bearer token authorization
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Set the application to listen on the provided port or default to 3000
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
