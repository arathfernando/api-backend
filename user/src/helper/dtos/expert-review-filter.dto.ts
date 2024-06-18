import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { EXPERT_REVIEW_SORT_BY } from '../constant';

export class ExpertReviewFilterDto {
  @ApiProperty()
  @IsNumber()
  public page: number;

  @ApiProperty()
  @IsNumber()
  public limit: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public search: string;

  @IsEnum(EXPERT_REVIEW_SORT_BY)
  @ApiProperty({
    enum: EXPERT_REVIEW_SORT_BY,
    required: true,
  })
  public sort_by: EXPERT_REVIEW_SORT_BY;
}
