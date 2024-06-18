import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { INVITE_STATUS } from 'src/core/constant/enum.constant';

export class ChangeStudentInviteStatusDto {
  @ApiProperty({
    required: true,
    enum: INVITE_STATUS,
  })
  @IsEnum(INVITE_STATUS)
  @IsNotEmpty()
  public invite_status: INVITE_STATUS;
}
