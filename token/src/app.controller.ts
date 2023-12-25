import { Controller, HttpStatus } from '@nestjs/common';
import { TokenService } from './services/token.service';
import { MessagePattern } from '@nestjs/microservices';
import { ITokenResponse } from './interfaces/token-response.interface';

@Controller('token')
export class AppController {
  constructor(private readonly tokenService: TokenService) {}

  /**
   * async createToken
   */
  @MessagePattern('token_create')
  public async createToken(data: { userId: string }): Promise<ITokenResponse> {
    let result: ITokenResponse;
    if (data && data.userId) {
      try {
        const createResult = await this.tokenService.createToken(data.userId);
        result = {
          status: HttpStatus.CREATED,
          message: 'token_create_success',
          token: createResult.token,
        };
      } catch (e) {
        result = {
          status: HttpStatus.BAD_REQUEST,
          message: 'token_create_bad_request',
          token: null,
        };
      }
    } else {
      result = {
        status: HttpStatus.BAD_REQUEST,
        message: 'token_create_bad_request',
        token: null,
      };
    }

    return result;
  }
}
