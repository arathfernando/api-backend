import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCourseBasicDTO {
  @ApiProperty({ type: 'string', example: 'Introduction to Machine Learning' })
  @IsString()
  course_title: string;

  @ApiProperty({ type: 'string', example: 'Introduction to Machine Learning' })
  @IsOptional()
  @IsString()
  course_description?: string;

  @ApiProperty({ type: 'number', example: 1 })
  @IsNumber()
  course_category: number;

  @ApiProperty({
    type: 'string',
    example: 'Learn the basics of Machine Learning',
  })
  @IsString()
  course_catch_line: string;

  @ApiProperty({ type: 'array', items: { type: 'number' }, example: [1, 2, 3] })
  @IsArray()
  goals: number[];

  @ApiProperty({ type: 'string', format: 'binary', required: true })
  public course_image: Express.Multer.File;
}
