import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ASSIGN_SHARE_FILTER } from '../constant';

export class GetAssignShareDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Search is not provided' })
  public search: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsEnum(ASSIGN_SHARE_FILTER)
  filter: ASSIGN_SHARE_FILTER;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  public minDate: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  public maxDate: string;

  @ApiProperty()
  @IsNumber()
  public page: number;

  @ApiProperty()
  @IsNumber()
  public limit: number;
}
