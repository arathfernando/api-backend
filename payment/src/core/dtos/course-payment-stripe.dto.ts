import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import {
  PAYMENT_METHOD,
  PAYMENT_OPTION,
} from 'src/core/constant/enum.constant';

export class CreatePaymentIntentDto {
  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiProperty()
  @IsString()
  currency: string;

  @ApiProperty()
  @IsString()
  metaData: string;
}
