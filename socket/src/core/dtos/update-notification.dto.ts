import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber } from 'class-validator';
import { SEEN_UNSEEN } from '../constant/enum.constant';

export class UpdateNotificationDto {
  @ApiProperty({
    required: true,
    enum: SEEN_UNSEEN,
  })
  @IsEnum(SEEN_UNSEEN)
  public seen_unseen: SEEN_UNSEEN;
}
