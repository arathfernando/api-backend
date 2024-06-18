import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { MARKET_FILTER, GIG_SORT_BY } from 'src/core/constant/enum.constant';

export class FilterDataDto {
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
  public category_id: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Search is not provided' })
  public search: string;

  @ApiProperty({
    enum: GIG_SORT_BY,
    required: false,
  })
  @IsOptional()
  @IsEnum(GIG_SORT_BY)
  public sort_by: GIG_SORT_BY;

  @ApiProperty({
    required: true,
    enum: MARKET_FILTER,
  })
  @IsEnum(MARKET_FILTER)
  public market_filter: MARKET_FILTER;
}
