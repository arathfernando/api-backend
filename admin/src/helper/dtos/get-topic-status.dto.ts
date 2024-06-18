import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

enum DTO_TOPIC_STATUS {
  ALL = 'ALL',
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}
export class GetTopicByStatus {
  @IsEnum(DTO_TOPIC_STATUS)
  @ApiProperty({
    enum: DTO_TOPIC_STATUS,
    required: true,
  })
  public status: DTO_TOPIC_STATUS;
}
