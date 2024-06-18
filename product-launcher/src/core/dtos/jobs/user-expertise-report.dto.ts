import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { REPORT_TYPE } from 'src/core/constant/enum.constant';

export class createUserExpertiseReportDto {
  @ApiProperty()
  @IsNumber()
  user_id: number;

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
    enum: REPORT_TYPE,
  })
  @IsOptional()
  @IsEnum(REPORT_TYPE)
  public report_type: REPORT_TYPE;
}

export class UpdateUserExpertiseReportDto {
  @ApiProperty()
  @IsNumber()
  user_id: number;

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
    enum: REPORT_TYPE,
  })
  @IsOptional()
  @IsEnum(REPORT_TYPE)
  public report_type: REPORT_TYPE;
}
