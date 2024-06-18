import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

export class ChooseGoalDto {
  @ApiProperty({
    required: true,
    type: [Number],
  })
  @IsArray()
  public goals: number[];
}
