import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import {
  OPERATION_TYPE,
  TRANSACTION_FOR_TYPE,
  TRANSACTION_TYPE,
} from '../constant/enum.constant';

export class CreateTransactionDto {
  @ApiProperty({
    required: true,
    enum: TRANSACTION_TYPE,
  })
  @IsEnum(TRANSACTION_TYPE)
  public transaction_from_type: TRANSACTION_TYPE;

  @ApiProperty({
    required: true,
    enum: TRANSACTION_TYPE,
  })
  @IsEnum(TRANSACTION_TYPE)
  public transaction_to_type: TRANSACTION_TYPE;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty({ message: 'Transaction amount is not provided' })
  public transaction_amount: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsNotEmpty({ message: 'Area is not provided' })
  public area: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  public transaction_from: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  public transaction_to: number;

  @ApiProperty({
    required: false,
  })
  @IsNumber()
  @IsOptional()
  public contest_prizes_id: number;

  @ApiProperty({
    required: true,
    enum: OPERATION_TYPE,
  })
  @IsEnum(OPERATION_TYPE)
  public operation_type: OPERATION_TYPE;

  @ApiProperty({
    required: true,
    enum: TRANSACTION_FOR_TYPE,
  })
  @IsEnum(TRANSACTION_FOR_TYPE)
  public transaction_for_type: TRANSACTION_FOR_TYPE;
}
