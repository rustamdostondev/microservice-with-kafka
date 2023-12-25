import { IUser } from './user.interfaces';

export interface IUserCreateResponse {
  status: number;
  message: string;
  user: IUser | null;
  errors: { [key: string]: any } | null;
}
