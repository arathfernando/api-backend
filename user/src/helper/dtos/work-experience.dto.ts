import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TRUE_FALSE } from '../constant';

export class WorkExperienceDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Please provide Company Name' })
  public company_name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Please provide Job Title' })
  public job_title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Please provide Start Date' })
  public start_date: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public end_date: string;

  @IsOptional()
  @IsEnum(TRUE_FALSE)
  @ApiProperty({
    enum: TRUE_FALSE,
  })
  public currently_working: TRUE_FALSE;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Please provide Description' })
  public description: string;
}
