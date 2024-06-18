import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { CreateQuizDto } from './create-quiz.dto';
import { UpdateQuizDto } from './update-quiz.dto';

export class QuizAllProcessDto {
  @ApiProperty({
    type: [CreateQuizDto],
    required: true,
  })
  @IsOptional()
  create_quiz: CreateQuizDto[];

  @ApiProperty({
    type: [UpdateQuizDto],
    required: false,
  })
  @IsOptional()
  update_quiz: UpdateQuizDto[];

  @ApiProperty({
    type: [Number],
    required: false,
  })
  @IsOptional()
  delete_quiz: number[];
}
