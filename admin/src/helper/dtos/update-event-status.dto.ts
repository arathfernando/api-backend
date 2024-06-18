import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

enum UPDATE_EVENT_STATUS {
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}
export class UpdateEventStatusDto {
  @IsEnum(UPDATE_EVENT_STATUS)
  @ApiProperty({
    enum: UPDATE_EVENT_STATUS,
    required: true,
  })
  public status: UPDATE_EVENT_STATUS;
}
