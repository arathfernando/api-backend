import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber } from 'class-validator';
export enum POST_LOCATION {
  COMMUNITY = 'COMMUNITY',
  GROUP = 'GROUP',
  ALL = 'ALL',
}
export class PostLocationFilterDto {
  @ApiProperty()
  @IsNumber()
  public page: number;

  @ApiProperty()
  @IsNumber()
  public limit: number;

  @ApiProperty({
    enum: POST_LOCATION,
  })
  @IsEnum(POST_LOCATION)
  article_location: POST_LOCATION;
}
