import { Module } from '@nestjs/common';
import { TaskController } from './task.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoConfigService } from './services/config/mongo-config.service';
import { TaskSchema } from './schemas/task.schema';
import { TaskService } from './services/task.service';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useClass: MongoConfigService,
    }),
    MongooseModule.forFeature([
      {
        name: 'Task',
        schema: TaskSchema,
      },
    ]),
  ],
  controllers: [TaskController],
  providers: [TaskService],
})
export class AppModule {}
