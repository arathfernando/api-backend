export interface IDecodeResponse {
  userId: number;
  first_name: string;
  last_name: string;
  email: string;
  settings: any;
}

export interface IDecodeVerificationToken {
  userId: number;
  email: string;
}
