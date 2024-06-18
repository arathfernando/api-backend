import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TRUE_FALSE } from '../constant';

export class UpdateCurrencyDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public name: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public name_plural: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public symbol: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  public symbol_native: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  public currency_code: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  public decimal_digit: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public rounding: string;

  @ApiProperty({
    enum: TRUE_FALSE,
    required: false,
  })
  @IsOptional()
  @IsEnum(TRUE_FALSE)
  public is_crypto: TRUE_FALSE;
}
