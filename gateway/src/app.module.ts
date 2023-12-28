import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserController } from './users.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Partitioners } from 'kafkajs';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './services/guards/authorization.guard';
import { TaskController } from './task.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'TOKEN_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'token',
            brokers: ['localhost:9092'],
          },
          consumer: {
            groupId: 'token-consumer',
          },
          producer: {
            createPartitioner: Partitioners.LegacyPartitioner,
          },
        },
      },
      {
        name: 'USER_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'user',
            brokers: ['localhost:9092'],
          },
          consumer: {
            groupId: 'user-consumer',
          },
          producer: {
            createPartitioner: Partitioners.LegacyPartitioner,
          },
        },
      },
      {
        name: 'TASK_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'task',
            brokers: ['localhost:9092'],
          },
          consumer: {
            groupId: 'task-consumer',
          },
          producer: {
            createPartitioner: Partitioners.LegacyPartitioner,
          },
        },
      },
    ]),
  ],
  controllers: [UserController, TaskController],
  providers: [
    ConfigService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
