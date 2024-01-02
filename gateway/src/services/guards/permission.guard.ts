import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject('PERMISSION_SERVICE')
    private readonly permissionServiceClient: ClientKafka,
  ) {
    this.permissionServiceClient.subscribeToResponseOf('permission_check');
  }
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const permission = this.reflector.get<string[]>(
      'permission',
      context.getHandler(),
    );

    if (!permission) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const permissionInfo = await firstValueFrom(
      this.permissionServiceClient.send('permission_check', {
        permission,
        user: request.user,
      }),
    );

    if (!permissionInfo || permissionInfo.status !== HttpStatus.OK) {
      throw new HttpException(
        {
          message: permissionInfo.message,
          data: null,
          errors: null,
        },
        permissionInfo.status,
      );
    }

    return true;
  }
}
