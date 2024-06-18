import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { COMMUNITY_TYPE, TRUE_FALSE } from 'src/core/constant/enum.constant';

export class UpdateCommunityDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public name: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  public country: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public state: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public city: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public district: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public latitude: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public longitude: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public place_id: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  public avatar: Express.Multer.File;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  public language: number;

  @ApiProperty({
    required: false,
    enum: TRUE_FALSE,
  })
  @IsOptional()
  @IsEnum(TRUE_FALSE)
  public is_global: TRUE_FALSE;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public tag_line: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public description: string;

  @ApiProperty({
    required: false,
    enum: COMMUNITY_TYPE,
  })
  @IsOptional()
  @IsEnum(COMMUNITY_TYPE)
  public community_type: COMMUNITY_TYPE;

  // @ApiProperty({
  //   isArray: true,
  //   required: false,
  //   type: [String],
  // })
  // @IsOptional()
  // @IsString()
  // public topics: string;
}
