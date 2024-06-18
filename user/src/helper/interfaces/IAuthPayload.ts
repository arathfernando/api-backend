import { User } from 'src/database/entities';

export interface IAuthPayload {
  accessToken: string;
  refreshToken: string;
  user: User;
}
