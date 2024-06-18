import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { INVITE_STATUS } from './workspace/workspace-expert.dto';
export enum COMMUNITY_USER_ROLE {
  COMMUNITY_LEADER = 'COMMUNITY_LEADER',
  HOST = 'HOST',
  MODERATOR = 'MODERATOR',
  MEMBER = 'MEMBER',
}

export class UpdateUsersToCommunityDto {
  @ApiProperty({
    required: false,
    type: [String],
    isArray: true,
  })
  @IsArray()
  @IsOptional()
  @IsNotEmpty({ message: 'Emails are not provided' })
  public users: string[];

  @ApiProperty({
    required: false,
    enum: COMMUNITY_USER_ROLE,
  })
  @IsEnum(COMMUNITY_USER_ROLE)
  @IsOptional()
  @IsNotEmpty({ message: 'Role is not provided' })
  public community_role: COMMUNITY_USER_ROLE;

  @ApiProperty({
    required: false,
    enum: INVITE_STATUS,
  })
  @IsEnum(INVITE_STATUS)
  @IsOptional()
  @IsNotEmpty({ message: 'status is not provided' })
  public invite_status: INVITE_STATUS;

  @ApiProperty({
    required: false,
  })
  @IsNumber()
  @IsOptional()
  public created_by: number;

  @ApiProperty({
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @IsNotEmpty({ message: 'Community is not provided' })
  public community_id: number;
}
