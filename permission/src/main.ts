import { NestFactory } from '@nestjs/core';
import { PermissionModule } from './permission.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    PermissionModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          brokers: ['localhost:9092'],
          clientId: 'permission',
        },
        consumer: {
          groupId: 'permission-consumer',
        },
      },
    },
  );
  await app.listen();
}
bootstrap();
