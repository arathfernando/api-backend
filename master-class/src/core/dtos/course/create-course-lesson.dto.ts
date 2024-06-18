import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { COURSE_ACCESS_TYPE } from 'src/core/constant/enum.constant';
export class CreateCourseLessonDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'title is not provided' })
  public lesson_title: string;

  @ApiProperty()
  @IsNumber()
  public course_id: number;

  @ApiProperty()
  @IsNumber()
  public chapter_id: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'description is not provided' })
  public lesson_description: string;

  @ApiProperty({ required: false })
  @IsOptional()
  public media: string;

  @ApiProperty({
    required: false,
    enum: COURSE_ACCESS_TYPE,
  })
  @IsOptional()
  @IsEnum(COURSE_ACCESS_TYPE)
  public course_access_type: COURSE_ACCESS_TYPE;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Please provide Date' })
  date: string;
}
