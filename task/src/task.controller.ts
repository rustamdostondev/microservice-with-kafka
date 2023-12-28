import { Controller, HttpStatus } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { TaskService } from './services/task.service';
import { ITask } from './interfaces/task.interface';
import { ITaskCreateResponse } from './interfaces/task-create-response.interfaces';

@Controller()
export class TaskController {
  constructor(private readonly taskService: TaskService) {}
  @MessagePattern('task_create')
  public async taskCreate(taskBody: ITask): Promise<ITaskCreateResponse> {
    let result: ITaskCreateResponse;
    if (taskBody) {
      try {
        taskBody.notification_id = null;
        taskBody.is_solved = false;
        const task = await this.taskService.createTask(taskBody);
        result = {
          status: HttpStatus.OK,
          message: 'task_create_success',
          task,
          errors: null,
        };
      } catch (e) {
        result = {
          status: HttpStatus.PRECONDITION_FAILED,
          message: 'task_create_precondition_failed',
          task: null,
          errors: e.errors,
        };
      }
    } else {
      result = {
        status: HttpStatus.BAD_REQUEST,
        message: 'task_create_bad_request',
        task: null,
        errors: null,
      };
    }

    return result;
  }
}
