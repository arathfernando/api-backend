import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class ContestOwnCriteriaSubmissionDTO {
  @ApiProperty({
    required: true,
  })
  @IsNumber()
  public contest_own_criteria_id: string;

  @ApiProperty({
    required: true,
  })
  @IsString()
  public description: string;
}
