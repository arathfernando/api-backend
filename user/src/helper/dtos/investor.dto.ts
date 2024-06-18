import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { EXP_INVESTOR, YES_NO } from '../constant';

export class InvestorDto {
  @IsEnum(EXP_INVESTOR)
  @ApiProperty({
    enum: EXP_INVESTOR,
    required: true,
  })
  public experience_investor: EXP_INVESTOR;

  @IsEnum(YES_NO)
  @ApiProperty({
    enum: YES_NO,
    required: true,
  })
  public agree_to_invest: YES_NO;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  public investment_currency?: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public investment_amount?: string;

  @IsEnum(YES_NO)
  @ApiProperty({
    enum: YES_NO,
    required: true,
  })
  public have_geo_preference: YES_NO;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public geo_preference?: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public city?: string;
}

export class UpdateInvestorDto {
  @ApiProperty({
    enum: EXP_INVESTOR,
    required: false,
  })
  @IsOptional()
  @IsEnum(EXP_INVESTOR)
  public experience_investor: EXP_INVESTOR;

  @ApiProperty({
    enum: YES_NO,
    required: false,
  })
  @IsOptional()
  @IsEnum(YES_NO)
  public agree_to_invest: YES_NO;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  public investment_currency?: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public investment_amount?: string;

  @ApiProperty({
    enum: YES_NO,
    required: false,
  })
  @IsOptional()
  @IsEnum(YES_NO)
  public have_geo_preference: YES_NO;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public geo_preference?: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public city?: string;
}
