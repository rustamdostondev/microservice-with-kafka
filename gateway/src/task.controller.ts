import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Authorization } from './decorators/authorization.decorator';
import { IAuthorizedRequest } from './common/authorized-request.interface';
import { CreateTaskResponseDto } from './interfaces/task/dto/create-task-response.dto';
import { CreateTaskDto } from './interfaces/task/dto/create-task.dto';
import { firstValueFrom } from 'rxjs';
import { GetTasksResponseDto } from './interfaces/task/dto/get-tasks-response.dto';
import { IServiceTaskSearchByUserIdResponse } from './interfaces/task/service-task-search-by-user-id-response.interface';
import { DeleteTaskResponseDto } from './interfaces/task/dto/delete-task-response.dto';
import { TaskIdDto } from './interfaces/task/dto/task-id.dto';
import { IServiceTaskDeleteResponse } from './interfaces/task/service-task-delete-response.interface';
import { UpdateTaskResponseDto } from './interfaces/task/dto/update-task-response.dto';
import { UpdateTaskDto } from './interfaces/task/dto/update-task.dto';
import { IServiceTaskUpdateByIdResponse } from './interfaces/task/service-task-update-by-id-response.interface';
import { Permission } from './decorators/permission.decorator';

@Controller('tasks')
@ApiTags('tasks')
export class TaskController {
  constructor(
    @Inject('TASK_SERVICE') private readonly taskClientService: ClientKafka,
  ) {
    this.taskClientService.subscribeToResponseOf('task_create');
    this.taskClientService.subscribeToResponseOf('task_search_by_user_id');
    this.taskClientService.subscribeToResponseOf('task_delete_by_id');
    this.taskClientService.subscribeToResponseOf('task_update_by_id');
    this.taskClientService.close();
  }

  @Post()
  @Authorization(true)
  @Permission('task_create')
  @ApiCreatedResponse({
    type: CreateTaskResponseDto,
  })
  public async createTask(
    @Req() request: IAuthorizedRequest,
    @Body() taskRequest: CreateTaskDto,
  ): Promise<CreateTaskResponseDto> {
    const userInfo = request.user;

    const createTaskResponse = await firstValueFrom(
      this.taskClientService.send(
        'task_create',
        Object.assign(taskRequest, {
          user_id: userInfo.id,
        }),
      ),
    );

    if (createTaskResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: createTaskResponse.message,
          data: null,
          errors: createTaskResponse.errors,
        },
        createTaskResponse.status,
      );
    }

    return {
      message: createTaskResponse.message,
      data: {
        task: createTaskResponse.task,
      },
      errors: null,
    };
  }

  @Get()
  @Authorization(true)
  @ApiOkResponse({
    type: GetTasksResponseDto,
    description: 'List of tasks for signed in user',
  })
  public async getTasks(
    @Req() request: IAuthorizedRequest,
  ): Promise<GetTasksResponseDto> {
    const userInfo = request.user;

    const tasksResponse: IServiceTaskSearchByUserIdResponse =
      await firstValueFrom(
        this.taskClientService.send('task_search_by_user_id', userInfo.id),
      );

    return {
      message: tasksResponse.message,
      data: {
        tasks: tasksResponse.tasks,
      },
      errors: null,
    };
  }

  @Delete(':id')
  @Authorization(true)
  @ApiCreatedResponse({
    type: DeleteTaskResponseDto,
  })
  public async deleteTask(
    @Req() request: IAuthorizedRequest,
    @Param() params: TaskIdDto,
  ): Promise<DeleteTaskResponseDto> {
    const userInfo = request.user;

    const deleteTaskResponse: IServiceTaskDeleteResponse = await firstValueFrom(
      this.taskClientService.send('task_delete_by_id', {
        id: params.id,
        userId: userInfo.id,
      }),
    );

    if (deleteTaskResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: deleteTaskResponse.message,
          data: null,
          errors: deleteTaskResponse.errors,
        },
        deleteTaskResponse.status,
      );
    }

    return {
      message: deleteTaskResponse.message,
      data: null,
      errors: null,
    };
  }

  @Put(':id')
  @Authorization(true)
  public async updateTask(
    @Req() request: IAuthorizedRequest,
    @Param() params: TaskIdDto,
    @Body() taskRequest: UpdateTaskDto,
  ): Promise<UpdateTaskResponseDto> {
    const userInfo = request.user;
    const updateTaskResponse: IServiceTaskUpdateByIdResponse =
      await firstValueFrom(
        this.taskClientService.send('task_update_by_id', {
          id: params.id,
          userId: userInfo.id,
          task: taskRequest,
        }),
      );

    if (updateTaskResponse.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: updateTaskResponse.message,
          errors: updateTaskResponse.errors,
          data: null,
        },
        updateTaskResponse.status,
      );
    }

    return {
      message: updateTaskResponse.message,
      data: {
        task: updateTaskResponse.task,
      },
      errors: null,
    };
  }
}
