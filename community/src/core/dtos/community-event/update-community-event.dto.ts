import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { EVENT_TYPE, YES_NO } from 'src/core/constant/enum.constant';

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
    type: [Number],
    items: { type: 'number' },
    example: [1, 2, 3],
  })
  @IsOptional()
  goals: number[];

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
  feedback: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  reason_of_the_rejection: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
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
  event_type: EVENT_TYPE;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  event_webpage: string;

  @ApiProperty({
    required: false,
    enum: YES_NO,
  })
  @IsOptional()
  @IsEnum(YES_NO)
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
    required: false,
    enum: YES_NO,
  })
  @IsOptional()
  @IsEnum(YES_NO)
  unlimited_seats: YES_NO;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  no_of_seats: number;

  @ApiProperty({
    required: false,
    enum: YES_NO,
  })
  @IsOptional()
  @IsEnum(YES_NO)
  single_day_event: YES_NO;

  @ApiProperty({
    required: false,
    type: [Number],
  })
  @IsOptional()
  tags: number[];
}
