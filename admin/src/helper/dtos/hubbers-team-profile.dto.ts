import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { YES_NO } from '../constant';

export class HubbersTeamProfileDto {
  @ApiProperty({
    required: true,
  })
  @IsNumber()
  @IsNotEmpty({ message: 'No user provided' })
  public user_id: number;

  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'No Join date provided' })
  public join_date: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'No Termination date provided' })
  public termination_date: string;

  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'No Title provided' })
  public title: string;

  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
  public description: string;

  @ApiProperty({
    enum: YES_NO,
    required: true,
  })
  @IsEnum(YES_NO)
  public is_terminated: YES_NO;

  @ApiProperty({
    enum: YES_NO,
    required: true,
  })
  @IsEnum(YES_NO)
  public is_published: YES_NO;
}
