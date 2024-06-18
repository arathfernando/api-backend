import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { EVENT_TYPE } from 'src/core/constant/enum.constant';
export class EventTypeDto {
  @ApiProperty({
    required: true,
    enum: EVENT_TYPE,
  })
  @IsEnum(EVENT_TYPE)
  @IsNotEmpty({ message: 'Event status is not provided.' })
  event_type: EVENT_TYPE;
}
