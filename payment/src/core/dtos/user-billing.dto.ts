import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateUserBillingDto {
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
  postcode: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  company: string;
}

export class UpdateUserBillingDto {
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
  postcode: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  company: string;
}
