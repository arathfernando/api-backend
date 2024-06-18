import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { COMMUNITY_STATUS } from 'src/core/constant/enum.constant';
export class StatusCommunityDto {
  @ApiProperty({
    required: true,
    enum: COMMUNITY_STATUS,
  })
  @IsEnum(COMMUNITY_STATUS)
  @IsNotEmpty({ message: 'Status is not provided.' })
  status: COMMUNITY_STATUS;
}
