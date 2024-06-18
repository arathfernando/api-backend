import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { POST_STATUS } from 'src/core/constant/enum.constant';

export class PostFilterDto {
  @ApiProperty({
    required: false,
    enum: POST_STATUS,
  })
  @IsEnum(POST_STATUS)
  @IsOptional()
  post_status: POST_STATUS;
}
