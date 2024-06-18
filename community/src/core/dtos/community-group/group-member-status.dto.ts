import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { GROUP_INVITE_STATUS } from 'src/core/constant/enum.constant';
export class StatusGroupMemberDto {
  @ApiProperty({
    required: true,
  })
  @IsNumber()
  @IsNotEmpty({ message: 'Group id is not provided.' })
  id: number;

  @ApiProperty({
    required: true,
    enum: GROUP_INVITE_STATUS,
  })
  @IsEnum(GROUP_INVITE_STATUS)
  @IsNotEmpty({ message: 'Status is not provided.' })
  status: GROUP_INVITE_STATUS;
}
