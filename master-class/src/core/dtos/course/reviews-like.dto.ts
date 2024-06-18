import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { YES_NO } from 'src/core/constant/enum.constant';

export class CreateReviewsLikeDto {
  @ApiProperty()
  @IsNumber()
  course_rating_id: number;

  @ApiProperty({
    enum: YES_NO,
    required: false,
  })
  @IsOptional()
  @IsEnum(YES_NO)
  public helpful: YES_NO;
}

export class UpdateReviewsLikeDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  course_rating_id: number;

  @ApiProperty({
    enum: YES_NO,
    required: false,
  })
  @IsOptional()
  @IsEnum(YES_NO)
  public helpful: YES_NO;
}
