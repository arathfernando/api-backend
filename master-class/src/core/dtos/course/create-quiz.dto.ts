import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNumber, IsString } from 'class-validator';
import { QUESTION_TYPE } from 'src/core/constant/enum.constant';

export class CreateQuizDto {
  @ApiProperty({ required: true })
  @IsNumber()
  course_lesson_id: number;

  @ApiProperty({ required: true })
  @IsNumber()
  lesson_activity_id: number;

  @ApiProperty({ required: true })
  @IsString()
  question_name: string;

  @ApiProperty({ required: true })
  @IsString()
  question_description: string;

  @ApiProperty({
    required: true,
    enum: QUESTION_TYPE,
  })
  @IsEnum(QUESTION_TYPE)
  question_type: QUESTION_TYPE;

  @ApiProperty({
    required: true,
    type: [String],
  })
  @IsArray()
  options: string[];

  @ApiProperty({
    required: true,
    type: [String],
  })
  @IsArray()
  answers: string[];
}
