import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
export enum COMMUNITY_USER_ROLE {
  COMMUNITY_LEADER = 'COMMUNITY_LEADER',
  HOST = 'HOST',
  MODERATOR = 'MODERATOR',
  MEMBER = 'MEMBER',
}

export class InviteUsersToCommunityDto {
  @ApiProperty({
    required: true,
    type: [String],
    isArray: true,
  })
  @IsArray()
  @IsNotEmpty({ message: 'Emails are not provided' })
  public users: string[];

  @ApiProperty({
    required: true,
    enum: COMMUNITY_USER_ROLE,
  })
  @IsEnum(COMMUNITY_USER_ROLE)
  @IsNotEmpty({ message: 'Role is not provided' })
  public community_role: COMMUNITY_USER_ROLE;

  @ApiProperty({
    required: true,
  })
  @IsString()
  public message: string;

  @ApiProperty({
    required: true,
  })
  @IsNumber()
  public created_by: number;

  @ApiProperty({
    required: true,
  })
  @IsNumber()
  @IsNotEmpty({ message: 'Community is not provided' })
  public community_id: number;
}
