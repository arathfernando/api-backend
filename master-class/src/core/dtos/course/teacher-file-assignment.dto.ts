import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateTeacherAssignmentDto {
  @ApiProperty({ required: true })
  @IsNumber()
  maximum_no_of_file: number;

  @ApiProperty({ required: true })
  @IsNumber()
  course_lesson_id: number;

  @ApiProperty({ required: true })
  @IsNumber()
  lesson_activity_id: number;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  date_due: string;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  time_due: string;

  @ApiProperty({
    required: true,
    type: [String],
  })
  @IsArray()
  add_file: string[];
}

export class UpdateTeacherAssignmentDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  maximum_no_of_file: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  course_lesson_id: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  lesson_activity_id: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  date_due: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  time_due: string;

  @ApiProperty({
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  add_file: string[];
}
