import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class AnswerPollDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty({ message: 'Community id is not provided' })
  public community_id: number;

  @ApiProperty({
    required: true,
  })
  @IsNumber()
  public selected_option_id: number;
}
