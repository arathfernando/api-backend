import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateStudentAssignmentFeedbackDto {
  @ApiProperty({ required: true })
  @IsNumber()
  student_file_assignment_id: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  feedback: string;
}

export class UpdateStudentAssignmentFeedbackDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  student_file_assignment_id: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  feedback: string;
}
