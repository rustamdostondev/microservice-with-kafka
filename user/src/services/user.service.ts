import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUserLink } from 'src/interfaces/user-link.interface';
import { IUser } from 'src/interfaces/user.interfaces';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<IUser>,
    @InjectModel('UserLink') private readonly userLinkModel: Model<IUserLink>,
  ) {}

  public async createUser(user: IUser): Promise<IUser> {
    const userModel = new this.userModel(user);
    return await userModel.save();
  }

  public async createUserLink(id: string): Promise<IUserLink> {
    const userLinkModel = new this.userLinkModel({
      user_id: id,
    });
    return await userLinkModel.save();
  }

  public async getUserLink(link: string): Promise<IUserLink[]> {
    return this.userLinkModel.find({ link, is_used: false }).exec();
  }

  public async searchUserById(id: string): Promise<IUser> {
    return this.userModel.findById(id).exec();
  }
}
