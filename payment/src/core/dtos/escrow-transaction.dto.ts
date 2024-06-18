import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { TRANSACTION_TYPE } from '../constant/enum.constant';
export class CreateEscrowTransactionDto {
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

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  public transaction_from: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  public transaction_from_payment_id: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  public transaction_to: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  public transaction_details: string;
}
