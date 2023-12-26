import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { TokenModule } from './token.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    TokenModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: 'token',
          brokers: ['localhost:9092'],
        },
        consumer: {
          groupId: 'token-consumer',
        },
      },
    },
  );

  app.listen();
}
bootstrap();
