import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IToken } from 'src/interfaces/token.interface';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel('TOKEN') private readonly tokenModel: Model<IToken>,
  ) {}

  /**
   * createToken
   */
  public createToken(userId: string): Promise<IToken> {
    const token = this.jwtService.sign(
      {
        userId,
      },
      {
        expiresIn: 30 * 24 * 60 * 60,
      },
    );

    return new this.tokenModel({
      user_id: userId,
      token,
    }).save();
  }

  /**
   * decodeToken
   */
  public async decodeToken(token: string) {
    const tokenModel = await this.tokenModel.find({ token });

    let result = null;

    if (tokenModel && tokenModel[0]) {
      try {
        const tokenData = this.jwtService.decode(tokenModel[0].token) as {
          exp: number;
          userId: string;
        };

        if (!tokenData || tokenData.exp <= Math.floor(+new Date() / 1000)) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          result = null;
        } else {
          result = {
            userId: tokenData.userId,
          };
        }
      } catch (error) {
        result = null;
      }
    }

    return result;
  }
}
