import { Controller, HttpStatus } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { TokenService } from './services/token.service';
import { ITokenResponse } from './interfaces/token-response.interface';
import { ITokenDataResponse } from './interfaces/token-data-response.interface';

@Controller('token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

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

  @MessagePattern('token_decode')
  public async decodeToken(data: {
    token: string;
  }): Promise<ITokenDataResponse> {
    const tokenData = await this.tokenService.decodeToken(data.token);
    return {
      status: tokenData ? HttpStatus.OK : HttpStatus.UNAUTHORIZED,
      message: tokenData ? 'token_decode_success' : 'token_decode_unauthorized',
      data: tokenData,
    };
  }
}
