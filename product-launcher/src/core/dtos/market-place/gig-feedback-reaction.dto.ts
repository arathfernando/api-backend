import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { YES_NO } from 'src/core/constant/enum.constant';

export class CreateFeedbackReactionDto {
  @ApiProperty({
    required: false,
    example: YES_NO.YES,
    enum: YES_NO,
  })
  @IsOptional()
  @IsEnum(YES_NO)
  is_helpful: YES_NO;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNotEmpty()
  feedback_id: number;
}

export class UpdateFeedbackReactionDto {
  @ApiProperty({
    required: false,
    example: YES_NO.YES,
    enum: YES_NO,
  })
  @IsOptional()
  @IsEnum(YES_NO)
  is_helpful: YES_NO;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNotEmpty()
  feedback_id: number;
}
