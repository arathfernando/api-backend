import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { COMMUNITY_STATUS, TRUE_FALSE, COMMUNITY_TYPE } from '../constant';

export class CreateCommunityDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'No name is provided' })
  public name: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty({ message: 'Country is not provided' })
  public country: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'State is not provided' })
  public state: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'City is not provided' })
  public city: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Latitude is not provided' })
  public latitude: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Longitude is not provided' })
  public longitude: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  public place_id: string;

  @ApiProperty({
    required: true,
  })
  @IsNumber()
  public created_by: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty({ message: 'Language is not provided' })
  public language: number;

  @ApiProperty({ type: 'string', format: 'binary', required: true })
  public avatar: Express.Multer.File;

  @ApiProperty({
    required: true,
    enum: TRUE_FALSE,
  })
  @IsEnum(TRUE_FALSE)
  public is_global: TRUE_FALSE;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Tag line is not provided' })
  public tag_line: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Description is not provided' })
  public description: string;

  @ApiProperty({
    required: true,
    enum: TRUE_FALSE,
  })
  @IsEnum(TRUE_FALSE)
  public is_published: TRUE_FALSE;

  @ApiProperty({
    required: false,
    enum: COMMUNITY_STATUS,
  })
  @IsOptional()
  @IsEnum(COMMUNITY_STATUS)
  public status: COMMUNITY_STATUS;

  @ApiProperty({
    required: true,
    enum: COMMUNITY_TYPE,
  })
  @IsEnum(COMMUNITY_TYPE)
  public community_type: COMMUNITY_TYPE;
}
