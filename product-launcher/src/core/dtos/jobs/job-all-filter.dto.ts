import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { JOB_FILTER, JOB_SORT } from 'src/core/constant/enum.constant';

export class JobALLFilterDTO {
  @IsEnum(JOB_FILTER)
  @ApiProperty({
    enum: JOB_FILTER,
    required: false,
  })
  @IsOptional()
  public job_filter: JOB_FILTER;

  @IsEnum(JOB_SORT)
  @ApiProperty({
    enum: JOB_SORT,
  })
  public sort: JOB_SORT;

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
  @IsNumber()
  public skill: number;

  @ApiProperty()
  @IsNumber()
  public page: number;

  @ApiProperty()
  @IsNumber()
  public limit: number;
}
