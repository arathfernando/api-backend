import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateUserExpertiseReviewReplyDTO {
  @ApiProperty()
  @IsNumber()
  proposal_review_id: number;

  @ApiProperty()
  @IsString()
  message: string;
}

export class UpdateUserExpertiseReviewReplyDTO {
  @ApiProperty()
  @IsNumber()
  proposal_review_id: number;

  @ApiProperty()
  @IsString()
  message: string;
}
