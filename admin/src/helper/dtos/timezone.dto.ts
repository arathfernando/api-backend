import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { TRUE_FALSE } from '../constant';

export class TimezoneDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Please provide timezone value' })
  public timezone_value: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Please provide timezone abbreviation' })
  public timezone_abbr: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Please provide offset' })
  public offset: string;

  @IsEnum(TRUE_FALSE)
  @ApiProperty({
    enum: TRUE_FALSE,
    required: true,
  })
  public dst: TRUE_FALSE;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Please provide timezone text' })
  public timezone_text: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Please provide timezone UTC' })
  public timezone_utc: string;
}
