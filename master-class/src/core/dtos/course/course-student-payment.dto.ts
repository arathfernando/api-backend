import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import {
  PAYMENT_METHOD,
  PAYMENT_OPTION,
} from 'src/core/constant/enum.constant';

export class CreateStudentPaymentDto {
  @ApiProperty()
  @IsNumber()
  course_id: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  amount: number;

  @ApiProperty({
    required: true,
    enum: PAYMENT_METHOD,
  })
  @IsEnum(PAYMENT_METHOD)
  public payment_method: PAYMENT_METHOD;

  @ApiProperty({
    required: true,
    enum: PAYMENT_OPTION,
  })
  @IsEnum(PAYMENT_OPTION)
  public payment_option: PAYMENT_OPTION;
}

export class UpdateStudentPaymentDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  course_id: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  amount: number;

  @ApiProperty({
    required: false,
    enum: PAYMENT_METHOD,
  })
  @IsOptional()
  @IsEnum(PAYMENT_METHOD)
  public payment_method: PAYMENT_METHOD;

  @ApiProperty({
    required: false,
    enum: PAYMENT_OPTION,
  })
  @IsOptional()
  @IsEnum(PAYMENT_OPTION)
  public payment_option: PAYMENT_OPTION;
}
