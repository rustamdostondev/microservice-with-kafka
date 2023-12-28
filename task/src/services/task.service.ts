import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ITask } from 'src/interfaces/task.interface';

@Injectable()
export class TaskService {
  constructor(@InjectModel('Task') private readonly taskModel: Model<ITask>) {}

  public async createTask(taskBody: ITask): Promise<ITask> {
    const taskModel = new this.taskModel(taskBody);
    return await taskModel.save();
  }

  public async getTaskByUserId(userId: string): Promise<ITask[]> {
    return this.taskModel.find({ user_id: userId }).exec();
  }

  public async removeTaskById(id: string) {
    return this.taskModel.findOneAndDelete({ _id: id });
  }

  public async findTaskById(id: string) {
    return this.taskModel.findById(id);
  }
}
