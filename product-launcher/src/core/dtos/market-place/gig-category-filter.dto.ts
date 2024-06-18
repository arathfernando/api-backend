import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export enum FILTER {
  ALL = 'ALL',
  MY_EXPERTISE = 'MY_EXPERTISE',
  BOUGHT_EXPERTISE = 'BOUGHT_EXPERTISE',
}

export class GigCategoryFilterDataDto {
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
}
