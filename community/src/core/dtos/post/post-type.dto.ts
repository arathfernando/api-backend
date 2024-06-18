import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { POST_TYPE } from 'src/core/constant/enum.constant';

export class PostTypeDto {
  @ApiProperty({
    enum: POST_TYPE,
    required: false,
  })
  @IsEnum(POST_TYPE)
  public post_type: POST_TYPE;
}
