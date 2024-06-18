import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class EducationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Please provide institute name' })
  public institute_name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Please provide degree' })
  public degree: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Graduation Year is required' })
  public graduation_year: string;
}
