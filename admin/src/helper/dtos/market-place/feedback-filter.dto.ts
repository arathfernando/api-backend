import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';
export enum REVIEW_FILTER {
  MOST_RECENT = 'MOST_RECENT',
  MOST_RELEVANT = 'MOST_RELEVANT',
}

export class FeedbackFilterDto {
  @ApiProperty()
  @IsNumber()
  public gig_id: number;

  @ApiProperty()
  @IsNumber()
  public page: number;

  @ApiProperty()
  @IsNumber()
  public limit: number;

  @ApiProperty({
    required: false,
    enum: REVIEW_FILTER,
  })
  @IsOptional()
  @IsEnum(REVIEW_FILTER)
  public filter: REVIEW_FILTER;
}
