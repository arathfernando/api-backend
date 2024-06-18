import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateCountryDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public country_name: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public short_name: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public continent: string;
}
