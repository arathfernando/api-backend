import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional } from 'class-validator';

export class StudentQuizDto {
  @ApiProperty()
  @IsNumber()
  question_id: number;

  @ApiProperty({
    required: true,
    type: [String],
  })
  @IsArray()
  public answers: string[];
}

export class UpdateStudentQuizDto {
  @ApiProperty()
  @IsNumber()
  question_id: number;

  @ApiProperty({
    required: false,
    type: [String],
  })
  @IsArray()
  @IsOptional()
  public answers: string[];
}
