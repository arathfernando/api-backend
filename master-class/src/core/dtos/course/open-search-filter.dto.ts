import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { OPEN_CLASS_FILTER } from 'src/core/constant/enum.constant';

export class OpenSearchFilterDataDto {
  @ApiProperty()
  @IsNumber()
  public page: number;

  @ApiProperty()
  @IsNumber()
  public limit: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  public language: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Search is not provided' })
  public search: string;

  @ApiProperty({
    required: true,
    enum: OPEN_CLASS_FILTER,
  })
  @IsEnum(OPEN_CLASS_FILTER)
  public class_filter: OPEN_CLASS_FILTER;
}
