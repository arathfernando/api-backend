import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

enum DTO_EVENT_INVITE_STATUS {
  ALL = 'ALL',
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}
export class GetEventByStatus {
  @IsEnum(DTO_EVENT_INVITE_STATUS)
  @ApiProperty({
    enum: DTO_EVENT_INVITE_STATUS,
    required: true,
  })
  public status: DTO_EVENT_INVITE_STATUS;
}
