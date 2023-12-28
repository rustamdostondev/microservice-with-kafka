import { NestFactory } from '@nestjs/core';
import { AppModule } from './task.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          brokers: ['localhost:9092'],
          clientId: 'task',
        },
        consumer: {
          groupId: 'task-consumer',
        },
      },
    },
  );
  await app.listen();
}
bootstrap();
