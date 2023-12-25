import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserController } from './users.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Partitioners } from 'kafkajs';

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
    ]),
  ],
  controllers: [UserController],
  providers: [
    ConfigService,
    // {
    //   provide: 'TOKEN_SERVICE',
    //   useFactory: (configService: ConfigService) => {
    //     const tokenServiceOptions = configService.get('tokenService');
    //     return ClientProxyFactory.create(tokenServiceOptions);
    //   },
    //   inject: [ConfigService],
    // },
  ],
})
export class AppModule {}
