import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { EventLectureDto } from './event-lecture.dto';
import { EventSpeakerDto } from './event-speaker.dto';
import { EventTimingDto } from './event-timing.dto';

export class EventAllProcessDto {
  @ApiProperty({
    type: EventSpeakerDto,
    required: true,
  })
  @IsOptional()
  create_event_speaker: EventSpeakerDto;

  @ApiProperty({
    type: [EventTimingDto],
    required: false,
  })
  @IsOptional()
  create_event_timing: EventTimingDto[];

  @ApiProperty({
    type: [EventLectureDto],
    required: false,
  })
  @IsOptional()
  create_event_lecture: EventLectureDto[];
}
