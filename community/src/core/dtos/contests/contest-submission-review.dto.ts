import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class ContestSubmissionReviewDto {
  @ApiProperty({
    required: true,
  })
  @IsNumber()
  public contest_own_criteria_submission_id: number;

  @ApiProperty({
    required: true,
  })
  @IsNumber()
  public rating: number;

  @ApiProperty({
    required: true,
  })
  @IsString()
  public remark: string;
}
