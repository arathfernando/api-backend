import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsEnum } from 'class-validator';
import { SEEN_UNSEEN } from '../constant/enum.constant';

export class GetNotificationByStatusDto {
  @ApiProperty()
  @IsNumber()
  public user_id: number;

  @ApiProperty({
    required: true,
    enum: SEEN_UNSEEN,
  })
  @IsEnum(SEEN_UNSEEN)
  status: SEEN_UNSEEN;
}
