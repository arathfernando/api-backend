import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { EVENT_TYPE, YES_NO, EVENT_STATUS } from '../constant';

export class UpdateCommunityEventDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  community_id: number;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  cover_image: Express.Multer.File;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  event_title: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Intro is not provided' })
  intro: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty({
    required: false,
    enum: EVENT_TYPE,
  })
  @IsOptional()
  @IsEnum(EVENT_TYPE)
  @IsNotEmpty({ message: 'Event type is not provided' })
  event_type: EVENT_TYPE;

  @ApiProperty({
    required: false,
    enum: EVENT_STATUS,
  })
  @IsOptional()
  @IsEnum(EVENT_STATUS)
  @IsNotEmpty({ message: 'Event status is not provided' })
  status: EVENT_STATUS;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Description is not provided' })
  event_webpage: string;

  @ApiProperty({
    required: false,
    enum: YES_NO,
  })
  @IsOptional()
  @IsEnum(YES_NO)
  @IsNotEmpty({ message: 'Is online event or not is not provided' })
  online_event: YES_NO;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Meeting link is not provided' })
  meeting_link: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Address is not provided' })
  address: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'City is not provided' })
  city: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Map link is not provided' })
  map_link: string;

  @ApiProperty({
    required: false,
    enum: YES_NO,
  })
  @IsOptional()
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
    required: false,
    enum: YES_NO,
  })
  @IsOptional()
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
