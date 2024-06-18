import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class EventTimingDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty({ message: 'Event id not provided' })
  event_id: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Start date is not provided' })
  start_date: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Start time is not provided' })
  start_time: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'End time is not provided' })
  end_time: string;
}

export class UpdateEventTimingDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty({ message: 'Id not provided' })
  id: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsNotEmpty({ message: 'Event id not provided' })
  event_id: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Start date is not provided' })
  start_date: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Start time is not provided' })
  start_time: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'End time is not provided' })
  end_time: string;
}
