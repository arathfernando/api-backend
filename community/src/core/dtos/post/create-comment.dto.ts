import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { POST_TYPE } from 'src/core/constant/enum.constant';

export class CreateCommentDto {
  @IsEnum(POST_TYPE)
  @ApiProperty({
    enum: POST_TYPE,
    required: true,
  })
  public post_type: POST_TYPE;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  public parent_comment_id: number;

  @ApiProperty({
    required: true,
  })
  @IsString()
  public comment: string;
}
