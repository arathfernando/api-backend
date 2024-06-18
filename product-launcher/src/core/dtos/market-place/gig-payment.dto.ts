import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import {
  PRICING_CURRENCY,
  PRICING_TYPE,
} from 'src/core/constant/enum.constant';
export class CreateGigPaymentDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  public installment: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty({ message: 'pricing is not provided' })
  public pricing: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty({ message: 'gig id not provided' })
  public gig_id: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty({ message: 'package id not provided' })
  public gig_package_id: number;

  @ApiProperty({
    required: true,
    enum: PRICING_TYPE,
  })
  @IsEnum(PRICING_TYPE)
  public pricing_type: PRICING_TYPE;

  @ApiProperty({
    required: true,
    enum: PRICING_CURRENCY,
  })
  @IsEnum(PRICING_CURRENCY)
  public pricing_currency: PRICING_CURRENCY;
}
