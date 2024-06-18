import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { ATTENDEE_STATUS } from 'src/core/constant/enum.constant';

export class AllowEventDto {
  @ApiProperty({
    required: true,
  })
  @IsNumber()
  user_id: number;

  @ApiProperty({
    required: true,
  })
  @IsNumber()
  event_id: number;

  @ApiProperty({
    required: true,
    enum: ATTENDEE_STATUS,
  })
  @IsEnum(ATTENDEE_STATUS)
  @IsNotEmpty({ message: 'Status is not provided.' })
  status: ATTENDEE_STATUS;
}
