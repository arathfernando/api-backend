import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ConversationNameDto {
  @ApiProperty({
    required: true,
  })
  @IsString()
  conversation_name: string;
}
