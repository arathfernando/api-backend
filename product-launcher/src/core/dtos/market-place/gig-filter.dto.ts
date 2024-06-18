import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { GIG_SORT_BY, GIG_STATUS } from 'src/core/constant/enum.constant';

export enum FILTER {
  ALL = 'ALL',
  MY_EXPERTISE = 'MY_EXPERTISE',
  BOUGHT_EXPERTISE = 'BOUGHT_EXPERTISE',
}

export class GigFilterDataDto {
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
    required: false,
    enum: FILTER,
  })
  @IsOptional()
  @IsEnum(FILTER)
  public filter: FILTER;

  @ApiProperty({
    required: false,
    enum: GIG_STATUS,
  })
  @IsOptional()
  @IsEnum(GIG_STATUS)
  public status: GIG_STATUS;
}
