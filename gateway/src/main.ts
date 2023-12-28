import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from './services/config/config.service';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = new ConfigService().get('port') || 8000;
  const PREFIX = '/api';

  const options = new DocumentBuilder()
    .setTitle('GATEWAY API docs ')
    .addTag('users')
    .addTag('tasks')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  await app.listen(port);
  Logger.log(`
API-GATEWAY RUNNING http://localhost:${port}${PREFIX}
  `);
}
bootstrap();
