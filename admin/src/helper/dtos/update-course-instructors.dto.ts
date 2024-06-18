import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsArray } from 'class-validator';
export class UpdateCourseInstructorDto {
  @ApiProperty({ required: false, type: 'array', items: { type: 'number' } })
  @IsOptional()
  @IsArray()
  public instructor_id: number[];

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  public course_basic: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public instructor_title: string;
}
