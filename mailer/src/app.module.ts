import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigService } from './services/config.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, ConfigService],
})
export class AppModule {}
