import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
export enum POST_LOCATION {
  COMMUNITY = 'COMMUNITY',
  GROUP = 'GROUP',
}

export class UpdateArticleDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public content: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public title: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public topics: string;

  @ApiProperty({
    enum: POST_LOCATION,
    required: false,
  })
  @IsOptional()
  @IsEnum(POST_LOCATION)
  public post_location: POST_LOCATION;
}
