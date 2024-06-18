import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class GetSingleReviewDto {
  @ApiProperty()
  @IsNumber()
  public id: number;

  @ApiProperty()
  @IsNumber()
  public contest_id: number;
}
