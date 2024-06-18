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

export class CreateAssignShareDTO {
  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  @IsInt()
  user: number;

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
  @IsNumber()
  share_qty: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  share_value: number;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  start_date: string;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  @IsEnum(YES_NO)
  global_share: YES_NO;
}

export class UpdateAssignShareDTO {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsInt()
  user: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsInt()
  zone: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  share_qty: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  share_value: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  start_date: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsEnum(YES_NO)
  global_share: YES_NO;
}
