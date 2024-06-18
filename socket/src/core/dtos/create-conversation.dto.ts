import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { CONVERSATION_TYPE } from '../constant/enum.constant';

export class CreateConversationDto {
  @ApiProperty({
    required: true,
    isArray: true,
    type: [Number],
  })
  @IsArray()
  public members: number[];

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  public gig_id: number;

  @ApiProperty({
    required: false,
    enum: CONVERSATION_TYPE,
  })
  @IsOptional()
  @IsEnum(CONVERSATION_TYPE)
  conversation_type: CONVERSATION_TYPE;
}
