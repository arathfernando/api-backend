import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { YES_NO } from 'src/core/constant/enum.constant';

export class CreateCustomerIdentityDto {
  @ApiProperty({
    required: true,
  })
  @IsNumber()
  public contest_id: number;

  @ApiProperty({
    enum: YES_NO,
    required: true,
  })
  @IsEnum(YES_NO)
  public contest_for_company: YES_NO;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public company_name: string;

  @ApiProperty({
    required: false,
    type: [Number],
  })
  @IsOptional()
  public partners: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public company_address: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public country: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public state: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public postcode: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public company_website: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  public company_logo: Express.Multer.File;

  @ApiProperty({
    enum: YES_NO,
    required: false,
  })
  @IsOptional()
  @IsEnum(YES_NO)
  public right_to_organize_contest: YES_NO;

  @ApiProperty({
    required: false,
    type: [String],
  })
  @IsOptional()
  public contest_coorganizer: string[];
}
