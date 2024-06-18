import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { POST_STATUS } from './update-post.dto';
export enum POST_LOCATION {
  COMMUNITY = 'COMMUNITY',
  GROUP = 'GROUP',
  ALL = 'ALL',
}
export class PostFilterDto {
  @ApiProperty({
    required: false,
    enum: POST_STATUS,
  })
  @IsEnum(POST_STATUS)
  @IsOptional()
  post_status: POST_STATUS;

  @ApiProperty({
    enum: POST_LOCATION,
  })
  @IsEnum(POST_LOCATION)
  post_location: POST_LOCATION;
}
