import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  ASSIGN_SHARE_FILTER,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
} from '../constant/enum.constant';

export class GetByTransactionTypeDto {
  @ApiProperty({
    required: false,
    enum: TRANSACTION_TYPE,
  })
  @IsOptional()
  @IsEnum(TRANSACTION_TYPE)
  public transaction_type: TRANSACTION_TYPE;

  @ApiProperty({
    required: false,
    enum: TRANSACTION_STATUS,
  })
  @IsOptional()
  @IsEnum(TRANSACTION_STATUS)
  public funds: TRANSACTION_STATUS;

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
