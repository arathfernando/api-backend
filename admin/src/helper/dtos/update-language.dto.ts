import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateLanguageDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public language_code: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public language_name: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public native_name: string;
}
