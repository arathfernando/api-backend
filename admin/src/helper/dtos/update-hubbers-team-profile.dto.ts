import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { YES_NO } from '../constant';

export class UpdateHubbersTeamProfileDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  public user_id: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public title: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public description: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public join_date: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public termination_date: string;

  @ApiProperty({
    enum: YES_NO,
    required: false,
  })
  @IsOptional()
  @IsEnum(YES_NO)
  public is_terminated: YES_NO;

  @ApiProperty({
    enum: YES_NO,
    required: false,
  })
  @IsOptional()
  @IsEnum(YES_NO)
  public is_published: YES_NO;
}
