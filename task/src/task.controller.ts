import { Controller, HttpStatus } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { TaskService } from './services/task.service';
import { ITask } from './interfaces/task.interface';
import { ITaskCreateResponse } from './interfaces/task-create-response.interfaces';
import { ITaskSearchByUserResponse } from './interfaces/task-search-by-user-response.interface';
import { ITaskDeleteResponse } from './interfaces/task-delete-response.interface';

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

  @MessagePattern('task_search_by_user_id')
  public async taskSearchByUserId(
    userId: string,
  ): Promise<ITaskSearchByUserResponse> {
    let result: ITaskSearchByUserResponse;

    if (userId) {
      const tasks = await this.taskService.getTaskByUserId(userId);
      result = {
        status: HttpStatus.OK,
        message: 'task_search_by_user_id_success',
        tasks,
      };
    } else {
      result = {
        status: HttpStatus.BAD_REQUEST,
        message: 'task_search_by_user_id_bad_request',
        tasks: null,
      };
    }

    return result;
  }

  @MessagePattern('task_delete_by_id')
  public async taskDeleteById(
    id: string,
    userId: string,
  ): Promise<ITaskDeleteResponse> {
    let result: ITaskDeleteResponse;

    const findTask = await this.taskService.findTaskById(id);

    if (findTask) {
      if (findTask.user_id === userId) {
        await this.taskService.removeTaskById(id);
        result = {
          status: HttpStatus.OK,
          message: 'task_delete_by_id_success',
          errors: null,
        };
      } else {
        result = {
          status: HttpStatus.FORBIDDEN,
          message: 'task_delete_by_id_forbidden',
          errors: null,
        };
      }
    } else {
      result = {
        status: HttpStatus.BAD_REQUEST,
        message: 'task_delete_by_id_bad_request',
        errors: null,
      };
    }
    return result;
  }
}
