import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class SubmissionReviewDto {
  @ApiProperty()
  @IsNumber()
  public contest_id: number;

  @ApiProperty()
  @IsNumber()
  public criteria_submission: number;
}
