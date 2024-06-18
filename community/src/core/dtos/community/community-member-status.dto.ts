import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';

enum DTO_COMMUNITY_INVITE_STATUS {
  ALL = 'ALL',
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export class StatusCommunityMemberDto {
  @ApiProperty({
    required: true,
  })
  @IsNumber()
  @IsNotEmpty({ message: 'Community id is not provided.' })
  id: number;

  @ApiProperty({
    required: true,
    enum: DTO_COMMUNITY_INVITE_STATUS,
  })
  @IsEnum(DTO_COMMUNITY_INVITE_STATUS)
  @IsNotEmpty({ message: 'Status is not provided.' })
  status: DTO_COMMUNITY_INVITE_STATUS;
}
