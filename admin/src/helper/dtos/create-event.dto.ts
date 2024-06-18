import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { EVENT_TYPE, YES_NO } from '../constant';
export class CreateCommunityEventDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  community_id: number;

  @ApiProperty({ type: 'string', format: 'binary', required: true })
  cover: Express.Multer.File;

  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Event title is not provided' })
  event_title: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  intro: string;

  @ApiProperty({
    required: true,
  })
  @IsString()
  description: string;

  @ApiProperty({
    required: false,
    enum: EVENT_TYPE,
  })
  @IsOptional()
  @IsEnum(EVENT_TYPE)
  event_type: EVENT_TYPE;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  event_webpage: string;

  @ApiProperty({
    required: true,
    enum: YES_NO,
  })
  @IsEnum(YES_NO)
  @IsNotEmpty({ message: 'Is online event or not is not provided' })
  online_event: YES_NO;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  meeting_link: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  address: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  city: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  map_link: string;

  @ApiProperty({
    required: true,
    enum: YES_NO,
  })
  @IsEnum(YES_NO)
  @IsNotEmpty({ message: 'Is unlimited seat is not provided' })
  unlimited_seats: YES_NO;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsNotEmpty({ message: 'No of seats is not provided' })
  no_of_seats: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsNotEmpty({ message: 'No of seats is not provided' })
  created_by: number;

  @ApiProperty({
    required: true,
    enum: YES_NO,
  })
  @IsEnum(YES_NO)
  @IsNotEmpty({ message: 'Is single day event is not provided' })
  single_day_event: YES_NO;

  @ApiProperty({
    required: false,
    type: [Number],
  })
  @IsOptional()
  tags: number[];

  @ApiProperty({
    required: false,
    type: [Number],
    items: { type: 'number' },
  })
  @IsOptional()
  goals: number[];
}
