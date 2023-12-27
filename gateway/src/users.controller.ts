import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Inject,
  OnModuleInit,
  Post,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserResponseDto } from './interfaces/user/dto/create-user-response.dto';
import { CreateUserDto } from './interfaces/user/dto/create-user.dto';
import { IServiceUserCreateResponse } from './interfaces/user/service-user-create-response.interface';
import { firstValueFrom } from 'rxjs';
import { IServiceTokenCreateResponse } from './interfaces/token/service-token-create-response.interface';

@Controller('users')
@ApiTags('users')
export class UserController implements OnModuleInit {
  constructor(
    @Inject('TOKEN_SERVICE') private readonly tokenServiceClient: ClientKafka,
    @Inject('USER_SERVICE') private readonly userServiceClient: ClientKafka,
  ) {}
  onModuleInit() {
    this.userServiceClient.subscribeToResponseOf('user_create');
    this.userServiceClient.close();
    this.tokenServiceClient.subscribeToResponseOf('token_create');
    this.tokenServiceClient.close();
  }

  @Post()
  @ApiCreatedResponse({
    type: CreateUserResponseDto,
  })
  public async createUser(
    @Body() userRequest: CreateUserDto,
  ): Promise<CreateUserResponseDto> {
    const createUserResponse: IServiceUserCreateResponse = await firstValueFrom(
      this.userServiceClient.send('user_create', userRequest),
    );

    if (createUserResponse.status !== HttpStatus.CREATED) {
      throw new HttpException(
        {
          message: createUserResponse.message,
          data: null,
          errors: createUserResponse.errors,
        },
        createUserResponse.status,
      );
    }

    const createTokenResponse: IServiceTokenCreateResponse =
      await firstValueFrom(
        this.tokenServiceClient.send('token_create', {
          userId: createUserResponse.user.id,
        }),
      );

    return {
      message: createUserResponse.message,
      data: {
        user: createUserResponse.user,
        token: createTokenResponse.token,
      },
      errors: null,
    };
  }
}
