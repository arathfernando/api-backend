import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { COURSE_STATUS } from '../constant';

export class CreateCourseDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'No title is provided' })
  public course_title: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty({ message: 'course category is not provided' })
  public course_category: number;

  @ApiProperty()
  @IsNumber()
  public created_by: number;

  @ApiProperty({
    required: true,
    enum: COURSE_STATUS,
  })
  @IsEnum(COURSE_STATUS)
  status: COURSE_STATUS;

  @ApiProperty({ type: 'number', example: 1 })
  @IsNumber()
  language: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'course catch line is not provided' })
  public course_catch_line: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'course description is not provided' })
  public course_description: string;

  @IsOptional()
  @ApiProperty({ required: false, type: 'string' })
  @IsString()
  course_requirements: string;

  @ApiProperty({ required: false, type: 'string' })
  @IsOptional()
  @IsString()
  what_you_will_learn: string;

  @ApiProperty({ type: 'string', format: 'binary', required: true })
  public course_image: Express.Multer.File;

  @ApiProperty({
    required: true,
  })
  @IsString()
  public goals: string;

  @ApiProperty({
    required: true,
  })
  @IsString()
  public start_date: string;

  @ApiProperty({
    required: true,
  })
  @IsString()
  public end_date: string;
}
