import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { HIDE_UNHIDE } from 'src/core/constant/enum.constant';

export class PostCommentHideDto {
  @IsEnum(HIDE_UNHIDE)
  @ApiProperty({
    enum: HIDE_UNHIDE,
    required: true,
  })
  public post_comment_status: HIDE_UNHIDE;
}
