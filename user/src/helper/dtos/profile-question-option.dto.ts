import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ProfileQuestionOptionDto {
  @ApiProperty({
    required: true,
  })
  @IsString()
  public option: string;
}
