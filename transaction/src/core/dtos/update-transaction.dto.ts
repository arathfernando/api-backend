import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsNumber, IsString } from 'class-validator';
import {
  OPERATION_TYPE,
  TRANSACTION_FOR_TYPE,
  TRANSACTION_TYPE,
} from '../constant/enum.constant';

export class UpdateTransactionDto {
  @ApiProperty({
    required: true,
    enum: TRANSACTION_TYPE,
  })
  @IsEnum(TRANSACTION_TYPE)
  @IsOptional()
  public transaction_from_type: TRANSACTION_TYPE;

  @ApiProperty({
    required: true,
    enum: TRANSACTION_TYPE,
  })
  @IsEnum(TRANSACTION_TYPE)
  @IsOptional()
  public transaction_to_type: TRANSACTION_TYPE;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  public transaction_amount: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsOptional()
  public area: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  public transaction_from: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  public transaction_to: number;

  @ApiProperty({
    required: true,
    enum: OPERATION_TYPE,
  })
  @IsOptional()
  @IsEnum(OPERATION_TYPE)
  public operation_type: OPERATION_TYPE;

  @ApiProperty({
    required: true,
    enum: TRANSACTION_FOR_TYPE,
  })
  @IsOptional()
  @IsEnum(TRANSACTION_FOR_TYPE)
  public transaction_for_type: TRANSACTION_FOR_TYPE;
}
