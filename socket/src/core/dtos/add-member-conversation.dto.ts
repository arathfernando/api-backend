import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

export class AddMemberToConversationDto {
  @ApiProperty({
    isArray: true,
    type: [Number],
    required: true,
  })
  @IsArray()
  public members: number[];
}
