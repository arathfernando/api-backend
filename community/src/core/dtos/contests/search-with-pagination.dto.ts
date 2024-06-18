import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import {
  CONTEST_FILTER,
  CONTEST_FILTER_SORT,
} from 'src/core/constant/enum.constant';

// enum CONTEST_STATE {
//   POPULAR = 'POPULAR',
//   ONGOING = 'ONGOING',
// }

export class SearchWithPaginationDto {
  @ApiProperty()
  @IsNumber()
  public page: number;

  @ApiProperty()
  @IsNumber()
  public limit: number;

  // @IsEnum(CONTEST_STATE)
  // @ApiProperty({
  //   enum: CONTEST_STATE,
  //   required: false,
  // })
  // public contest_state: CONTEST_STATE;

  @IsEnum(CONTEST_FILTER)
  @ApiProperty({
    enum: CONTEST_FILTER,
    required: true,
  })
  public contest_filter: CONTEST_FILTER;

  @IsEnum(CONTEST_FILTER_SORT)
  @ApiProperty({
    enum: CONTEST_FILTER_SORT,
    required: true,
  })
  public sort_by: CONTEST_FILTER_SORT;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  public name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  public contest_category: number;
}
