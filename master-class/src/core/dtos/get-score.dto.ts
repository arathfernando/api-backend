import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class ScoreDto {
  @ApiProperty()
  @IsNumber()
  public teacher_quiz_id: number;

  @ApiProperty()
  @IsNumber()
  public lesson_activity_id: number;
}
