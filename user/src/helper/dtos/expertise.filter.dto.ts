import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { EXPERT_FILTER, EXPERT_SORT } from '../constant';

export class ExpertFilterDto {
  @IsEnum(EXPERT_FILTER)
  @ApiProperty({
    enum: EXPERT_FILTER,
    required: false,
  })
  @IsOptional()
  public expert_filter: EXPERT_FILTER;

  @IsEnum(EXPERT_SORT)
  @ApiProperty({
    enum: EXPERT_SORT,
  })
  public sort: EXPERT_SORT;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public search: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  public skill: number;

  @ApiProperty()
  @IsNumber()
  public page: number;

  @ApiProperty()
  @IsNumber()
  public limit: number;
}
