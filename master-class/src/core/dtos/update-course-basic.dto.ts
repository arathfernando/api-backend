import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCourseBasicDTO {
  @ApiProperty({ type: 'string', example: 'Introduction to Machine Learning' })
  @IsOptional()
  @IsString()
  course_title?: string;

  @ApiProperty({ type: 'string', example: 'Introduction to Machine Learning' })
  @IsOptional()
  @IsString()
  course_description?: string;

  @ApiProperty({ type: 'number', example: 1 })
  @IsOptional()
  @IsNumber()
  course_category?: number;

  @ApiProperty({
    type: 'string',
    example: 'Learn the basics of Machine Learning',
  })
  @IsOptional()
  @IsString()
  course_catch_line?: string;

  @ApiProperty({ type: 'array', items: { type: 'number' }, example: [1, 2, 3] })
  @IsOptional()
  @IsArray()
  goals?: number[];

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  public course_image: Express.Multer.File;
}
