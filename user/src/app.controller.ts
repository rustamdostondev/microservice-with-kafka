import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern } from '@nestjs/microservices';
import { IUser } from './interfaces/user.interfaces';
import { IUserCreateResponse } from './interfaces/user-create-response.interface';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('user_create')
  /**
   * async createUser
   */
  public async createUser(userParams: any): Promise<any> {
    console.log(userParams);

    return userParams;
  }
}
