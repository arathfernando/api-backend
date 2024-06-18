import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { decode, JwtPayload, sign } from 'jsonwebtoken';
import {
  IDecodeResponse,
  IDecodeVerificationToken,
} from './helper/interfaces/IDecodeResponse';
import { ITokenResponse } from './helper/interfaces/ITokenResponse';
import { IVerificationToken } from './helper/interfaces/IVerificationToken';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}

  public createToken(data: any): ITokenResponse {
    const accessToken = sign(
      {
        userId: data.id,
        first_name: data.general_profile
          ? data.general_profile.first_name
          : null,
        last_name: data.general_profile ? data.general_profile.last_name : null,
        email: data.email,
      },
      this.configService.get<string>('auth.access_token_secret'),
      { expiresIn: this.configService.get<string>('auth.access_token_exp') },
    );

    const refreshToken = sign(
      {
        userId: data.id,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
      },
      this.configService.get<string>('auth.refresh_token_secret'),
      { expiresIn: this.configService.get<string>('auth.refresh_token_exp') },
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  public async decodeToken(
    token: string,
  ): Promise<string | JwtPayload | IDecodeResponse> {
    return decode(token);
  }

  public createVerificationToken(data: any): IVerificationToken {
    const verificationToken = sign(
      {
        userId: data.id,
        email: data.email,
      },
      this.configService.get<string>('auth.verification_token_secret'),
      {
        expiresIn: this.configService.get<string>(
          'auth.verification_token_exp',
        ),
      },
    );

    return {
      verificationToken,
    };
  }

  public async decodeVerificationToken(
    token: string,
  ): Promise<string | JwtPayload | IDecodeVerificationToken> {
    return decode(token);
  }

  public createCommunityJoinToken(data: any): IVerificationToken {
    const verificationToken = sign(
      {
        userId: data.id,
        email: data.email,
      },
      this.configService.get<string>('auth.community_invite_token_secret'),
      {
        expiresIn: this.configService.get<string>(
          'auth.community_invite_token_exp',
        ),
      },
    );

    return {
      verificationToken,
    };
  }

  public async decodeCommunityJoinToken(
    token: string,
  ): Promise<string | JwtPayload | IDecodeVerificationToken> {
    return decode(token);
  }
}
