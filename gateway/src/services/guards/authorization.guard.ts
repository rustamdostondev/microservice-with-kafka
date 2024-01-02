import {
  Injectable,
  Inject,
  CanActivate,
  ExecutionContext,
  HttpException,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject('TOKEN_SERVICE') private readonly tokenServiceClient: ClientKafka,
    @Inject('USER_SERVICE') private readonly userServiceClient: ClientKafka,
  ) {
    this.tokenServiceClient.subscribeToResponseOf('token_decode');
    this.userServiceClient.subscribeToResponseOf('user_get_by_id');
  }

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const secured = this.reflector.get<string[]>(
      'secured',
      context.getHandler(),
    );

    if (!secured) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userTokenInfo = await firstValueFrom(
      this.tokenServiceClient.send('token_decode', {
        token: request?.headers?.authorization,
      }),
    );

    if (!userTokenInfo || !userTokenInfo.data) {
      throw new HttpException(
        {
          message: userTokenInfo.message,
          data: null,
          errors: null,
        },
        userTokenInfo.status,
      );
    }

    const userInfo = await firstValueFrom(
      this.userServiceClient.send(
        'user_get_by_id',
        userTokenInfo?.data?.userId,
      ),
    );

    request.user = userInfo?.user;
    return true;
  }
}
