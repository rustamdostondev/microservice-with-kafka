import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Post,
  Req,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserResponseDto } from './interfaces/user/dto/create-user-response.dto';
import { CreateUserDto } from './interfaces/user/dto/create-user.dto';
import { IServiceUserCreateResponse } from './interfaces/user/service-user-create-response.interface';
import { firstValueFrom } from 'rxjs';
import { IServiceTokenCreateResponse } from './interfaces/token/service-token-create-response.interface';
import { GetUserByTokenResponseDto } from './interfaces/user/dto/get-user-by-token-response.dto';
import { IAuthorizedRequest } from './common/authorized-request.interface';
import { IServiceUserGetByIdResponse } from './interfaces/user/service-user-get-by-id-response.interface';
import { Authorization } from './decorators/authorization.decorator';

@Controller('users')
@ApiTags('users')
export class UserController {
  constructor(
    @Inject('TOKEN_SERVICE') private readonly tokenServiceClient: ClientKafka,
    @Inject('USER_SERVICE') private readonly userServiceClient: ClientKafka,
  ) {
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

  @Get()
  @Authorization(true)
  @ApiOkResponse({
    type: GetUserByTokenResponseDto,
  })
  public async getUserByToken(
    @Req() request: IAuthorizedRequest,
  ): Promise<GetUserByTokenResponseDto> {
    const userInfo = request.user;

    const userResponse: IServiceUserGetByIdResponse = await firstValueFrom(
      this.userServiceClient.send('user_get_by_id', userInfo.id),
    );

    return {
      message: userResponse.message,
      data: {
        user: userResponse.user,
      },
      errors: null,
    };
  }
}
