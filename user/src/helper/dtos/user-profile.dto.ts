import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ProfileQuestionAnswerDto } from './profile-question-answer.dto';

export class UserProfileDto {
  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Profile type is not provided' })
  public profile_type: string;

  @ApiProperty({
    required: false,
    type: [ProfileQuestionAnswerDto],
  })
  @IsArray()
  public question_answer: ProfileQuestionAnswerDto[];
}
