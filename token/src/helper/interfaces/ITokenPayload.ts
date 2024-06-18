export interface IDecodeTokenPayload {
  token: string;
}

export interface ICreateTokenPayload {
  userId: number;
  first_name: string;
  last_name: string;
  email: string;
}
