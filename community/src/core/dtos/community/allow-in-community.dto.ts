import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { COMMUNITY_INVITE_STATUS } from 'src/core/constant/enum.constant';

export class AllowCommunityDto {
  @ApiProperty({
    required: true,
  })
  @IsNumber()
  user_id: number;

  @ApiProperty({
    required: true,
  })
  @IsNumber()
  community_id: number;

  @ApiProperty({
    required: true,
    enum: COMMUNITY_INVITE_STATUS,
  })
  @IsEnum(COMMUNITY_INVITE_STATUS)
  @IsNotEmpty({ message: 'Status is not provided.' })
  status: COMMUNITY_INVITE_STATUS;
}
