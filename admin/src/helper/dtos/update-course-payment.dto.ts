import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
export enum PRICING_CURRENCY {
  CASH = 'CASH',
  HBB_TOKEN = 'HBB_TOKEN',
}
export enum COURSE_PRICING_TYPE {
  ONE_TIME = 'ONE_TIME',
  INSTALLMENT = 'INSTALLMENT',
}
export class UpdateCoursePaymentDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsNotEmpty({ message: 'installment is not provided' })
  public installment: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsNotEmpty({ message: 'pricing is not provided' })
  public pricing: number;

  @ApiProperty({
    required: false,
    enum: COURSE_PRICING_TYPE,
  })
  @IsOptional()
  @IsEnum(COURSE_PRICING_TYPE)
  public pricing_type: COURSE_PRICING_TYPE;

  @ApiProperty({
    required: false,
    enum: PRICING_CURRENCY,
  })
  @IsOptional()
  @IsEnum(PRICING_CURRENCY)
  public pricing_currency: PRICING_CURRENCY;
}
