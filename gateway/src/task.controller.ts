import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Inject,
  Post,
  Req,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { Authorization } from './decorators/authorization.decorator';
import { IAuthorizedRequest } from './common/authorized-request.interface';
import { CreateTaskResponseDto } from './interfaces/task/dto/create-task-response.dto';
import { CreateTaskDto } from './interfaces/task/dto/create-task.dto';
import { firstValueFrom } from 'rxjs';

@Controller('tasks')
@ApiTags('tasks')
export class TaskController {
  constructor(
    @Inject('TASK_SERVICE') private readonly taskClientService: ClientKafka,
  ) {
    this.taskClientService.subscribeToResponseOf('task_create');
    this.taskClientService.close();
  }

  @Post()
  @Authorization(true)
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
}
