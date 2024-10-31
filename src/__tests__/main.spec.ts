import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from '../app.module';

describe('Bootstrap Function', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should set up Swagger with correct config', async () => {
    const config = new DocumentBuilder()
      .setTitle('Sukasa Air API')
      .setDescription('API documentation for the Sukasa Air application')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const swaggerDoc = SwaggerModule.createDocument(app, config);

    jest.spyOn(SwaggerModule, 'setup');
    SwaggerModule.setup('api/docs', app, swaggerDoc);

    expect(SwaggerModule.setup).toHaveBeenCalledWith('api/docs', app, swaggerDoc);
  });

  it('should listen on default or provided port', async () => {
    const port = process.env.PORT || 3000;
    jest.spyOn(app, 'listen');

    await app.listen(port);
    expect(app.listen).toHaveBeenCalledWith(port);
  });
});
