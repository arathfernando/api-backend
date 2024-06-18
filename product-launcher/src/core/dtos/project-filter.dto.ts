import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { PROJECT_OWNER_FILTER, PROJECT_SORT } from '../constant/enum.constant';

export class ProjectFilterDto {
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
  public search: string;

  @ApiProperty({
    required: false,
    example: PROJECT_OWNER_FILTER.ANYONE,
    enum: PROJECT_OWNER_FILTER,
  })
  @IsOptional()
  @IsEnum(PROJECT_OWNER_FILTER, {
    message: 'Invalid PROJECT_OWNER_FILTER value',
  })
  owner: PROJECT_OWNER_FILTER;

  @ApiProperty({
    required: false,
    example: PROJECT_SORT.DATE_CREATED,
    enum: PROJECT_SORT,
  })
  @IsOptional()
  @IsEnum(PROJECT_SORT, {
    message: 'Invalid PROJECT_SORT value',
  })
  sort_by: PROJECT_SORT;
}
