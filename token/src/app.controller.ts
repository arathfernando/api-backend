import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { JwtPayload } from 'jsonwebtoken';
import { AppService } from './app.service';
import {
  IDecodeResponse,
  IDecodeVerificationToken,
} from './helper/interfaces/IDecodeResponse';
import { ITokenResponse } from './helper/interfaces/ITokenResponse';
import { IVerificationToken } from './helper/interfaces/IVerificationToken';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('token_create')
  public async createToken(@Payload() data: any): Promise<ITokenResponse> {
    data = JSON.parse(data);
    return this.appService.createToken(data);
  }

  @MessagePattern('token_decode')
  public async decodeToken(
    @Payload() data: string,
  ): Promise<string | JwtPayload | IDecodeResponse> {
    return this.appService.decodeToken(data);
  }

  @MessagePattern('verification_token_create')
  public async createVerificationToken(
    @Payload() data: any,
  ): Promise<IVerificationToken> {
    data = JSON.parse(data);
    return this.appService.createVerificationToken(data);
  }

  @MessagePattern('verification_token_decode')
  public async decodeVerificationToken(
    @Payload() data: any,
  ): Promise<string | JwtPayload | IDecodeVerificationToken> {
    return this.appService.decodeVerificationToken(data);
  }

  @MessagePattern('community_join_token_create')
  public async createCommunityJoinToken(
    @Payload() data: any,
  ): Promise<IVerificationToken> {
    data = JSON.parse(data);
    return this.appService.createCommunityJoinToken(data);
  }

  @MessagePattern('community_join_token_decode')
  public async decodeCommunityJoinToken(
    @Payload() data: any,
  ): Promise<string | JwtPayload | IDecodeVerificationToken> {
    return this.appService.decodeCommunityJoinToken(data);
  }
}
