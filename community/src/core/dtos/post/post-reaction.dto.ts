import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { POST_TYPE, REACTION_TYPE } from 'src/core/constant/enum.constant';

export class PostReactionDto {
  @ApiProperty({
    required: true,
    enum: REACTION_TYPE,
  })
  @IsEnum(REACTION_TYPE)
  public reaction_type: REACTION_TYPE;
}
