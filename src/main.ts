import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3000;
  app.enableCors({ origin: 'http://localhost:3001' });
  const options = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('SISAR')
    .setDescription('Backend em NestJS para aplicação de controle de processos Aprova Rápido.',)
    .setVersion('versão 1.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);
  await app.listen(port);
  console.log("API Aprova Rápido rodando em http://localhost:" + port);
  console.log("SwaggerUI rodando em http://localhost:" + port + "/api");
}
bootstrap();