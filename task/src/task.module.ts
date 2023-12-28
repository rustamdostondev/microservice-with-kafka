import { Module } from '@nestjs/common';
import { AppController } from './task.controller';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
