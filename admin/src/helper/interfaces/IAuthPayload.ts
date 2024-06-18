import Admin from 'src/database/entities/admin.entity';

export interface IAuthPayload {
  accessToken: string;
  refreshToken: string;
  user: Admin;
}
