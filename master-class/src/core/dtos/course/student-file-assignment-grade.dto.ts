import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class CreateStudentAssignmentGradeDto {
  @ApiProperty({ required: true })
  @IsNumber()
  student_file_assignment_id: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  grade: number;
}

export class UpdateStudentAssignmentGradeDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  student_file_assignment_id: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  grade: number;
}
