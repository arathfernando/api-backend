import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { QUESTION_TYPE } from 'src/core/constant/enum.constant';

export class UpdateQuizDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  course_lesson_id: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  lesson_activity_id: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  question_name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  question_description: string;

  @ApiProperty({
    required: false,
    enum: QUESTION_TYPE,
  })
  @IsOptional()
  @IsEnum(QUESTION_TYPE)
  question_type: QUESTION_TYPE;

  @ApiProperty({
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  options: string[];

  @ApiProperty({
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  answers: string[];
}
