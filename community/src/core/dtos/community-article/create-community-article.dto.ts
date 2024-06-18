import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { POST_LOCATION } from 'src/core/constant/enum.constant';

export class CreateArticleDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty({ message: 'Community/Group id is not provided' })
  public id: number;

  @ApiProperty({
    required: true,
  })
  @IsString()
  public content: string;

  @ApiProperty({
    required: true,
  })
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
    required: true,
  })
  @IsEnum(POST_LOCATION)
  public post_location: POST_LOCATION;
}
