import { Controller, HttpStatus } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { IUser } from './interfaces/user.interfaces';
import { IUserCreateResponse } from './interfaces/user-create-response.interface';
import { UserService } from './services/user.service';
import { IUserSearchResponse } from './interfaces/user-search-response.interface';

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
        await this.userService.createUserLink(createdUser.id);
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

  @MessagePattern('user_get_by_id')
  public async getUserById(id: string): Promise<IUserSearchResponse> {
    let result: IUserSearchResponse;

    if (id) {
      const user = await this.userService.searchUserById(id);
      if (user) {
        result = {
          status: HttpStatus.OK,
          message: 'user_get_by_id_success',
          user,
        };
      } else {
        result = {
          status: HttpStatus.NOT_FOUND,
          message: 'user_get_by_id_not_found',
          user: null,
        };
      }
    } else {
      result = {
        status: HttpStatus.BAD_REQUEST,
        message: 'user_get_by_id_bad_request',
        user: null,
      };
    }

    return result;
  }
}
