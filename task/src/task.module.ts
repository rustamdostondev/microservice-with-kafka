import { Module } from '@nestjs/common';
import { AppController } from './task.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoConfigService } from './services/config/mongo-config.service';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useClass: MongoConfigService,
    }),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
