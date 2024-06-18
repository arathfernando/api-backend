import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CountryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Country is not provided' })
  public country_name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Short name is not provided' })
  public short_name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Continent is not provided' })
  public continent: string;
}
