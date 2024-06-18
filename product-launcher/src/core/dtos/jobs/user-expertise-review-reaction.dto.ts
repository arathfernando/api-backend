import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateUserExpertiseReviewReactionDto {
  @ApiProperty({ example: 'Reaction' })
  @IsNotEmpty()
  reaction: string;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  user_expertise_review_id: number;
}

export class UpdateUserExpertiseReviewReactionDto {
  @ApiProperty({ example: 'Reaction', required: false })
  @IsOptional()
  reaction: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  user_expertise_review_id: number;
}
