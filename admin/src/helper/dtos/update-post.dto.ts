import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
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
export enum POST_STATUS {
  PUBLISHED = 'PUBLISHED',
  REMOVE = 'REMOVE',
}

export class UpdatePostDto {
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
    required: false,
  })
  @IsOptional()
  public created_by: number;

  @ApiProperty({
    enum: POST_LOCATION,
    required: false,
  })
  @IsOptional()
  @IsEnum(POST_LOCATION)
  public post_location: POST_LOCATION;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public remove_feedback: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public reason_of_rejection: string;

  @IsEnum(POST_STATUS)
  @ApiProperty({
    enum: POST_STATUS,
    required: false,
  })
  @IsOptional()
  public post_status: POST_STATUS;
}
