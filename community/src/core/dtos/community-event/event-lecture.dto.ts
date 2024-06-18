import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class EventLectureDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty({ message: 'Event id not provided' })
  event_id: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty({ message: 'speaker id not provided' })
  speaker_id: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty({ message: 'Event timing id not provided' })
  event_timing_id: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'title is not provided' })
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Start time is not provided' })
  start_time: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Start time is not provided' })
  location: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'End time is not provided' })
  end_time: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'description is not provided' })
  description: string;

  @ApiProperty({ type: 'string', required: true })
  public cover: string;
}

export class UpdateEventLectureDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty({ message: 'id not provided' })
  id: number;
  @ApiProperty({
    required: true,
  })
  @IsNumber()
  @IsNotEmpty({ message: 'Event id not provided' })
  event_id: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsNotEmpty({ message: 'speaker id not provided' })
  speaker_id: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsNotEmpty({ message: 'Event timing id not provided' })
  event_timing_id: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'title is not provided' })
  title: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'location is not provided' })
  location: string;

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

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'description is not provided' })
  description: string;

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  public cover: string;
}
