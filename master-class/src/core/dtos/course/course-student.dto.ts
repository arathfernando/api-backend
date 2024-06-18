import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber } from 'class-validator';

export class StudentDto {
  @ApiProperty()
  @IsNumber()
  course_id: number;

  @ApiProperty({
    required: true,
    type: [Number],
  })
  @IsArray()
  public user: number[];
}
