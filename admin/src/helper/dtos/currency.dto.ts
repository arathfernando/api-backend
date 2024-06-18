import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TRUE_FALSE } from '../constant';

export class CurrencyDto {
  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Name is not provided' })
  public name: string;

  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Name plural is not provided' })
  public name_plural: string;

  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Symbol is not provided' })
  public symbol: string;

  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Symbol native is not provided' })
  public symbol_native: string;

  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Currency Code is not provided' })
  public currency_code: string;

  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Decimal Digit is not provided' })
  public decimal_digit: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public rounding: string;

  @IsEnum(TRUE_FALSE)
  @ApiProperty({
    enum: TRUE_FALSE,
    required: true,
  })
  public is_crypto: TRUE_FALSE;
}
