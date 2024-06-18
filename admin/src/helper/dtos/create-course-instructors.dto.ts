import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsArray, IsString, IsNotEmpty } from 'class-validator';
export class CreateCourseInstructorDto {
  @ApiProperty({ type: 'array', items: { type: 'number' } })
  @IsArray()
  public instructor_id: number[];

  @ApiProperty()
  @IsNumber()
  public course_id: number;

  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'course instructor name is not provided' })
  public instructor_title: string;
}
