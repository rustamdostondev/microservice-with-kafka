import { Controller, HttpStatus } from '@nestjs/common';
import { ConfirmedStrategyService } from './services/confirmed-strategy.service';
import { MessagePattern } from '@nestjs/microservices';
import { IUser } from 'src/interfaces/user.interface';
import { permissions } from './constants/permissions';
import { IPermissionCheckResponse } from './interfaces/permission-check-response.interface';

@Controller()
export class PermissionController {
  constructor(private confirmedStrategy: ConfirmedStrategyService) {}

  @MessagePattern('permission_check')
  public async permissionCheck(params: {
    user: IUser;
    permission: string;
  }): Promise<IPermissionCheckResponse> {
    let result: IPermissionCheckResponse;

    if (!params || !params.user) {
      result = {
        status: HttpStatus.BAD_REQUEST,
        message: 'permission_check_bad_request',
        errors: null,
      };
    } else {
      const allowedPermissions = this.confirmedStrategy.getAllowedPermissions(
        params.user,
        permissions,
      );
      const isAllowed = allowedPermissions.includes(params.permission);

      result = {
        status: isAllowed ? HttpStatus.OK : HttpStatus.FORBIDDEN,
        message: isAllowed
          ? 'permission_check_success'
          : 'permission_check_forbidden',
        errors: null,
      };
    }
    return result;
  }
}
