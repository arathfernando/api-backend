import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TRUE_FALSE } from '../constant';

export class UpdateTimezoneDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public timezone_value: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public timezone_abbr: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public offset: string;

  @ApiProperty({
    enum: TRUE_FALSE,
    required: true,
  })
  @IsOptional()
  @IsEnum(TRUE_FALSE)
  public dst: TRUE_FALSE;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public timezone_text: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public timezone_utc: string;
}
