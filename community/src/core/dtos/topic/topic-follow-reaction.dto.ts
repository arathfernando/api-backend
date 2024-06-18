import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { FOLLOW_REACTION_TYPE } from 'src/core/constant/enum.constant';

export class TopicFollowReactionDto {
  @ApiProperty({
    required: true,
    enum: FOLLOW_REACTION_TYPE,
  })
  @IsEnum(FOLLOW_REACTION_TYPE)
  public reaction_type: FOLLOW_REACTION_TYPE;
}
