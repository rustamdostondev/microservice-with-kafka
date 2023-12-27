import { Controller, HttpStatus } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { IUser } from './interfaces/user.interfaces';
import { IUserCreateResponse } from './interfaces/user-create-response.interface';
import { UserService } from './services/user.service';

@Controller()
export class AppController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern('user_create')
  public async createUser(
    @Payload() userParams: IUser,
  ): Promise<IUserCreateResponse> {
    let result: IUserCreateResponse;
    if (userParams) {
      try {
        userParams.is_confirmed = false;
        const createdUser = await this.userService.createUser(userParams);
        delete createdUser.password;
        result = {
          status: HttpStatus.CREATED,
          message: 'user_create_success',
          user: createdUser,
          errors: null,
        };
      } catch (e) {
        result = {
          status: HttpStatus.PRECONDITION_FAILED,
          message: 'user_create_precondition_failed',
          user: null,
          errors: e.errors,
        };
      }
    } else {
      result = {
        status: HttpStatus.BAD_REQUEST,
        message: 'user_create_bad_request',
        user: null,
        errors: null,
      };
    }
    console.log(result);

    return result;
  }
}
