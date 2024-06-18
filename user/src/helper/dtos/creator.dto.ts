import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { WHEN_LAUNCH, YES_NO } from '../constant';

export class CreatorDto {
  @IsEnum(YES_NO)
  @ApiProperty({
    enum: YES_NO,
    required: true,
  })
  public launching_new_product: YES_NO;

  @IsEnum(YES_NO)
  @ApiProperty({
    enum: YES_NO,
    required: true,
  })
  public built_product: YES_NO;

  @ApiProperty({
    required: true,
  })
  @IsString()
  public portfolio_link: string;

  @ApiProperty({
    enum: WHEN_LAUNCH,
    required: false,
  })
  @IsOptional()
  @IsEnum(WHEN_LAUNCH)
  public when_launching_product?: WHEN_LAUNCH;

  @ApiProperty({
    enum: YES_NO,
    required: false,
  })
  @IsOptional()
  @IsEnum(YES_NO)
  public have_team?: YES_NO;

  @ApiProperty({
    required: false,
    isArray: true,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  public expertise?: string[];

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
  })
  @IsOptional()
  @IsString()
  public project_description?: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public profile_tagline?: string;
}
export class UpdateCreatorDto {
  @ApiProperty({
    enum: YES_NO,
    required: false,
  })
  @IsOptional()
  @IsEnum(YES_NO)
  public launching_new_product: YES_NO;

  @ApiProperty({
    enum: YES_NO,
    required: false,
  })
  @IsOptional()
  @IsEnum(YES_NO)
  public built_product: YES_NO;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public portfolio_link: string;

  @ApiProperty({
    enum: WHEN_LAUNCH,
    required: false,
  })
  @IsOptional()
  @IsEnum(WHEN_LAUNCH)
  public when_launching_product?: WHEN_LAUNCH;

  @ApiProperty({
    enum: YES_NO,
    required: false,
  })
  @IsOptional()
  @IsEnum(YES_NO)
  public have_team?: YES_NO;

  @ApiProperty({
    required: false,
    isArray: true,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  public expertise?: string[];

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
  })
  @IsOptional()
  @IsString()
  public project_description?: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public profile_tagline: string;
}
