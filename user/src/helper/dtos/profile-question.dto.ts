import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsString } from 'class-validator';
import { ProfileQuestionOptionDto } from './profile-question-option.dto';

export class ProfileQuestionDto {
  @ApiProperty({
    required: false,
  })
  @IsNumber()
  public parent_id: number;

  @ApiProperty({
    required: true,
  })
  @IsString()
  public profile_type: string;

  @ApiProperty({
    required: true,
  })
  @IsString()
  public question: string;

  @ApiProperty({
    required: true,
    type: ProfileQuestionOptionDto,
    isArray: true,
  })
  @IsArray()
  public options: ProfileQuestionOptionDto[];
}
