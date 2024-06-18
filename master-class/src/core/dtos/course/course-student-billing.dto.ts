import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateStudentBillingDto {
  @ApiProperty()
  @IsNumber()
  course_id: number;

  @ApiProperty()
  @IsString()
  first_name: string;

  @ApiProperty()
  @IsString()
  last_name: string;
  @ApiProperty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsString()
  country: string;

  @ApiProperty()
  @IsString()
  state: string;

  @ApiProperty()
  @IsString()
  post_code: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  company: string;
}

export class UpdateStudentBillingDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  course_id: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  first_name: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  last_name: string;
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  address: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  country: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  state: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  post_code: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  company: string;
}
