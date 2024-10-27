import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe()); // Enables validation for DTOs
  const config = new DocumentBuilder()
    .setTitle('Sukasa Air API')
    .setDescription('API documentation for the Sukasa Air application')
    .setVersion('1.0')
    .addBearerAuth() // Adds Bearer token for authorization
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
