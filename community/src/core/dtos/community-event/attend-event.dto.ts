import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class AttendEventDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty({ message: 'Event id is not provided' })
  event_id: number;
}
