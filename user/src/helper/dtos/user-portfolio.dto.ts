import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { CONTENT_TYPE, PORTFOLIO_TYPE } from '../constant';

export class CreateUserPortFolioDTO {
  @ApiProperty({
    required: true,
  })
  @IsString()
  public title: string;

  @ApiProperty({
    required: true,
  })
  @IsString()
  public description: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public website_link: string;

  @ApiProperty({
    enum: CONTENT_TYPE,
    required: true,
  })
  @IsEnum(CONTENT_TYPE)
  public content_type: CONTENT_TYPE;

  @ApiProperty({
    enum: PORTFOLIO_TYPE,
    required: true,
  })
  @IsEnum(PORTFOLIO_TYPE)
  public portfolio_type: PORTFOLIO_TYPE;

  @ApiProperty({
    required: true,
    type: [Number],
  })
  @IsArray()
  public skills: number[];

  @ApiProperty({
    required: true,
    type: [String],
  })
  @IsArray()
  public attachments: string[];
}

export class UpdateUserPortFolioDTO {
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
  public website_link: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public description: string;

  @ApiProperty({
    enum: PORTFOLIO_TYPE,
    required: false,
  })
  @IsOptional()
  @IsEnum(PORTFOLIO_TYPE)
  public portfolio_type: PORTFOLIO_TYPE;

  @ApiProperty({
    enum: CONTENT_TYPE,
    required: false,
  })
  @IsOptional()
  @IsEnum(CONTENT_TYPE)
  public content_type: CONTENT_TYPE;

  @ApiProperty({
    required: false,
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  public skills: number[];

  @ApiProperty({
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  public attachments: string[];
}
