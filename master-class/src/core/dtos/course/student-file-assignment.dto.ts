import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional } from 'class-validator';

export class CreateStudentAssignmentDto {
  @ApiProperty({ required: true })
  @IsNumber()
  teacher_file_assignment_id: number;

  @ApiProperty({
    required: true,
    type: [String],
  })
  @IsArray()
  add_file: string[];
}

export class UpdateStudentAssignmentDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  teacher_file_assignment_id: number;

  @ApiProperty({
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  add_file: string[];
}
