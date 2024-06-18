import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { GIG_REPORT_TYPE } from 'src/core/constant/enum.constant';

export class createGigReportDto {
  @ApiProperty()
  @IsNumber()
  gig_id: number;

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
  public proof_of_your_copyright: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public content_url: string;

  @ApiProperty({
    required: false,
    enum: GIG_REPORT_TYPE,
  })
  @IsOptional()
  @IsEnum(GIG_REPORT_TYPE)
  public report_type: GIG_REPORT_TYPE;
}

export class UpdateGigReportDto {
  @ApiProperty()
  @IsNumber()
  gig_id: number;

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
  public proof_of_your_copyright: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public content_url: string;

  @ApiProperty({
    required: false,
    enum: GIG_REPORT_TYPE,
  })
  @IsOptional()
  @IsEnum(GIG_REPORT_TYPE)
  public report_type: GIG_REPORT_TYPE;
}
