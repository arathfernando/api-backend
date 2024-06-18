import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsInt,
  IsEnum,
  IsString,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { YES_NO } from '../constant';

export class CreateAreaDTO {
  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  @IsInt()
  zone: number;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  share_percentage: string;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  amount_share: number;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  expected_start_date: string;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  @IsEnum(YES_NO)
  global_share: YES_NO;
}

export class UpdateAreaDTO {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  share_percentage: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  amount_share: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  expected_start_date: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsEnum(YES_NO)
  global_share: YES_NO;
}
