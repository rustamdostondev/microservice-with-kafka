import { IUser } from 'src/interfaces/user/user.interface';

export interface IAuthorizedRequest extends Request {
  user?: IUser;
}
