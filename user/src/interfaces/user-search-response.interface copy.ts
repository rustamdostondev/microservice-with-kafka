import { IUser } from './user.interfaces';

export interface IUserSearchResponse {
  status: number;
  message: string;
  user: IUser | null;
}
