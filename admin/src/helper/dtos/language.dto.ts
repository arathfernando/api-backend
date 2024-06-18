import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LanguageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Language Code not provided' })
  public language_code: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Language Name is not provided' })
  public language_name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Native name id not provided' })
  public native_name: string;
}
