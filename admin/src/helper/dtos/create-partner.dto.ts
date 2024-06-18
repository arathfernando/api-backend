import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import {
  PARTNERSHIP_AREA,
  YES_NO,
  PARTNERSHIP_DURATION,
  STATUS,
} from '../constant';

export class ContactDto {
  @ApiProperty({
    required: false,
    enum: YES_NO,
  })
  @IsOptional()
  @IsEnum(YES_NO)
  public has_hubbers_profile: YES_NO;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public hubbers_username: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public email: string;
}

export class CreatePartnerDto {
  @ApiProperty({ required: true })
  @IsString()
  public partner_name: string;

  @ApiProperty({
    required: true,
  })
  @IsNumber()
  public created_by: number;

  @ApiProperty({
    required: false,
    enum: YES_NO,
  })
  @IsOptional()
  @IsEnum(YES_NO)
  public have_contest: YES_NO;

  @ApiProperty({
    required: false,
    type: [Number],
    items: { type: 'number' },
    example: [1, 2, 3],
  })
  @IsOptional()
  contest: number[];

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public partner_link: string;

  @ApiProperty({ type: 'string', format: 'binary', required: true })
  public partner_image: Express.Multer.File;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  public language: string;

  @ApiProperty({
    required: true,
    enum: PARTNERSHIP_AREA,
  })
  @IsEnum(PARTNERSHIP_AREA)
  public partnership_area: PARTNERSHIP_AREA;

  @ApiProperty({
    required: true,
    enum: STATUS,
  })
  @IsEnum(STATUS)
  public status: STATUS;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public partner_description: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  public partner_type: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  public community: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public goals: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public partnership_activity: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public partnership_engagement: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public partnership_goal: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public contacts: string;

  @ApiProperty({
    required: false,
    enum: YES_NO,
  })
  @IsOptional()
  @IsEnum(YES_NO)
  public have_expertise: YES_NO;

  @ApiProperty({
    required: false,
    type: [Number],
    items: { type: 'number' },
    example: [1, 2, 3],
  })
  @IsOptional()
  expertise: number[];

  @ApiProperty({
    required: false,
    enum: YES_NO,
  })
  @IsOptional()
  @IsEnum(YES_NO)
  public support_project: YES_NO;

  @ApiProperty({
    required: false,
    type: [Number],
    items: { type: 'number' },
    example: [1, 2, 3],
  })
  @IsOptional()
  projects: number[];

  @ApiProperty({
    required: false,
    enum: PARTNERSHIP_DURATION,
  })
  @IsOptional()
  @IsEnum(PARTNERSHIP_DURATION)
  public partnership_duration: PARTNERSHIP_DURATION;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public partnership_start_date: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public partnership_end_date: string;
}
