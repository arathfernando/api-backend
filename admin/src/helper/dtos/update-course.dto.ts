import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { COURSE_STATUS } from '../constant';
export enum COURSE_ACCESS_TYPE {
  PAID = 'PAID',
  DRAFT = 'DRAFT',
  FREE = 'FREE',
  PRIVATE = 'PRIVATE',
}

export class UpdateCourseDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public course_title: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  public created_by: number;

  @ApiProperty({ type: 'number', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  language: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  public course_category: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public course_catch_line: string;

  @ApiProperty({
    required: false,
    enum: COURSE_STATUS,
  })
  @IsOptional()
  @IsEnum(COURSE_STATUS)
  status: COURSE_STATUS;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public course_description: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  public course_image: Express.Multer.File;

  @ApiProperty({
    required: false,
    enum: COURSE_ACCESS_TYPE,
  })
  @IsOptional()
  @IsEnum(COURSE_ACCESS_TYPE)
  public course_access_type: COURSE_ACCESS_TYPE;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public goals: string;

  @IsOptional()
  @ApiProperty({ required: false, type: 'string' })
  @IsString()
  course_requirements: string;

  @ApiProperty({ required: false, type: 'string' })
  @IsOptional()
  @IsString()
  what_you_will_learn: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public start_date: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public end_date: string;
}
