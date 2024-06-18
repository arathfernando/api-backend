import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { TRUE_FALSE } from '../constant';
export enum POST_LOCATION {
  COMMUNITY = 'COMMUNITY',
  GROUP = 'GROUP',
}
export enum POST_SHARE_TYPE {
  EVENT = 'EVENT',
  MASTER_CLASS = 'MASTER_CLASS',
  FREELANCER = 'FREELANCER',
  EXPERTISE = 'EXPERTISE',
}

export class CreatePostDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty({ message: 'Community/Group id is not provided' })
  public id: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  public created_by: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public content: string;

  @ApiProperty({
    type: 'array',
    items: {
      type: 'file',
      items: {
        type: 'string',
        format: 'binary',
      },
    },
    required: false,
  })
  @IsOptional()
  public attachments: any[];

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public topics: string;

  @ApiProperty({
    enum: POST_LOCATION,
    required: true,
  })
  @IsEnum(POST_LOCATION)
  public post_location: POST_LOCATION;

  @ApiProperty({
    enum: TRUE_FALSE,
    required: true,
  })
  @IsEnum(TRUE_FALSE)
  public is_share: TRUE_FALSE;

  @ApiProperty({
    enum: POST_SHARE_TYPE,
    required: false,
  })
  @IsOptional()
  @IsEnum(POST_SHARE_TYPE)
  public post_share_type: POST_SHARE_TYPE;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  public share_id: number;
}
