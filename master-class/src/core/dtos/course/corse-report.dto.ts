import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { CONTENT_TYPE, REPORT_TYPE } from 'src/core/constant/enum.constant';

export class createCorseReportDto {
  @ApiProperty()
  @IsNumber()
  course_id: number;

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
    enum: CONTENT_TYPE,
  })
  @IsOptional()
  @IsEnum(CONTENT_TYPE)
  public content_type: CONTENT_TYPE;

  @ApiProperty({
    required: false,
    enum: REPORT_TYPE,
  })
  @IsOptional()
  @IsEnum(REPORT_TYPE)
  public report_type: REPORT_TYPE;
}

export class UpdateCorseReportDto {
  @ApiProperty()
  @IsNumber()
  course_id: number;

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
    enum: CONTENT_TYPE,
  })
  @IsOptional()
  @IsEnum(CONTENT_TYPE)
  public content_type: CONTENT_TYPE;

  @ApiProperty({
    required: false,
    enum: REPORT_TYPE,
  })
  @IsOptional()
  @IsEnum(REPORT_TYPE)
  public report_type: REPORT_TYPE;
}
