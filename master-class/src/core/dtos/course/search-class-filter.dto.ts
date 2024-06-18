import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { CLASS_SORT_BY, STATE, STATUS } from 'src/core/constant/enum.constant';

export class SearchClassFilterDataDto {
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
    required: true,
    enum: STATE,
  })
  @IsEnum(STATE)
  public state: STATE;

  @ApiProperty({
    required: false,
    enum: CLASS_SORT_BY,
  })
  @IsOptional()
  @IsEnum(CLASS_SORT_BY)
  public sort_by: CLASS_SORT_BY;

  @ApiProperty({
    required: true,
    enum: STATUS,
  })
  @IsEnum(STATUS)
  public status: STATUS;
}
