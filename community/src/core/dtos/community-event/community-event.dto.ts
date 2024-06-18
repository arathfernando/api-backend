import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { EVENT_TYPE, YES_NO } from 'src/core/constant/enum.constant';

export class CommunityEventDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  community_id: number;

  @ApiProperty({
    required: false,
    type: [Number],
    items: { type: 'number' },
    example: [1, 2, 3],
  })
  @IsOptional()
  goals: number[];

  @ApiProperty({ type: 'string', format: 'binary', required: true })
  cover_image: Express.Multer.File;

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
  @IsNotEmpty({ message: 'Description is not provided' })
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
  no_of_seats: number;

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
}
