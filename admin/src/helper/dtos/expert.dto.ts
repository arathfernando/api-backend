import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { TIME_AVAILABILITY, YES_NO } from '../constant';

export class ExpertDto {
  @ApiProperty({
    required: true,
    isArray: true,
    type: [String],
  })
  @IsArray()
  public expertise: string[];

  @ApiProperty({
    required: false,
    isArray: true,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  public extra_expertise: string[];

  @ApiProperty({
    required: false,
    type: [Number],
  })
  @IsOptional()
  skills: number[];

  @ApiProperty({
    required: true,
  })
  @IsNumber()
  public rate_currency: number;

  @ApiProperty({
    required: true,
  })
  @IsString()
  public charge_per_hour: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  public description: string;

  @IsEnum(TIME_AVAILABILITY)
  @ApiProperty({
    enum: TIME_AVAILABILITY,
    required: true,
  })
  public time_availability: TIME_AVAILABILITY;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public hour_per_week?: string;

  @IsEnum(YES_NO)
  @ApiProperty({
    enum: YES_NO,
    required: true,
  })
  public want_to_earn_hbb: YES_NO;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public portfolio_link: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public profile_tagline: string;
}

export class UpdateExpertDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  public description: string;

  @ApiProperty({
    required: false,
    isArray: true,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  public expertise: string[];

  @ApiProperty({
    required: false,
    isArray: true,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  public extra_expertise?: string[];

  @ApiProperty({
    required: false,
    type: [Number],
  })
  @IsOptional()
  skills: number[];

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  public rate_currency: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public charge_per_hour: string;

  @ApiProperty({
    enum: TIME_AVAILABILITY,
    required: false,
  })
  @IsOptional()
  @IsEnum(TIME_AVAILABILITY)
  public time_availability: TIME_AVAILABILITY;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public hour_per_week?: string;

  @ApiProperty({
    enum: YES_NO,
    required: false,
  })
  @IsEnum(YES_NO)
  @IsOptional()
  public want_to_earn_hbb: YES_NO;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public portfolio_link: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public profile_tagline: string;
}
