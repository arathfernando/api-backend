import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { COURSE_ACCESS_TYPE } from 'src/core/constant/enum.constant';
export class UpdateCourseLessonDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNotEmpty({ message: 'title is not provided' })
  public lesson_title: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNotEmpty({ message: 'description is not provided' })
  public lesson_description: string;

  @ApiProperty()
  @IsNumber()
  public chapter_id: number;

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

  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
  date: string;
}
