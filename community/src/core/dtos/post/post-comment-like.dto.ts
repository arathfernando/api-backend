import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { REACTION_TYPE } from 'src/core/constant/enum.constant';

export class PostCommentLikeDto {
  @IsEnum(REACTION_TYPE)
  @ApiProperty({
    enum: REACTION_TYPE,
    required: true,
  })
  public reaction_type: REACTION_TYPE;
}
