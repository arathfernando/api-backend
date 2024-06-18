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

export class CreateCoursePaymentDto {
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
  @IsNotEmpty({ message: 'course id not provided' })
  public course_id: number;

  @ApiProperty({
    required: true,
    enum: COURSE_PRICING_TYPE,
  })
  @IsEnum(COURSE_PRICING_TYPE)
  public pricing_type: COURSE_PRICING_TYPE;

  @ApiProperty({
    required: true,
    enum: PRICING_CURRENCY,
  })
  @IsEnum(PRICING_CURRENCY)
  public pricing_currency: PRICING_CURRENCY;
}
