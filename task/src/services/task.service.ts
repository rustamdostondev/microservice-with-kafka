import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ITask } from 'src/interfaces/task.interface';

@Injectable()
export class TaskService {
  constructor(@InjectModel('Task') private readonly taskModel: Model<ITask>) {}

  /**
   * createTask
   */
  public async createTask(taskBody: ITask): Promise<ITask> {
    const taskModel = new this.taskModel(taskBody);
    return await taskModel.save();
  }
}
