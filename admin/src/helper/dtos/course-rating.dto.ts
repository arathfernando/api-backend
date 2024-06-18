import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCourseRatingDto {
  @ApiProperty()
  @IsNumber()
  over_all_rating: number;

  @ApiProperty()
  @IsNumber()
  lesson_content: number;

  @ApiProperty()
  @IsNumber()
  lesson_activity: number;

  @ApiProperty()
  @IsNumber()
  teacher_quality: number;

  @ApiProperty()
  @IsNumber()
  course_id: number;

  @ApiProperty()
  @IsNumber()
  created_by: number;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  comment: string;
}

export class UpdateCourseRatingDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  over_all_rating: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  lesson_content: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  lesson_activity: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  teacher_quality: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  course_id: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  created_by: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  title: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  comment: string;
}
