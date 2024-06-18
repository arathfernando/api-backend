import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty, IsArray } from 'class-validator';

export class AssignTopicDto {
  @ApiProperty({
    required: true,
  })
  @IsNumber()
  @IsNotEmpty({ message: 'No community id is provided' })
  public community_id: number;

  @ApiProperty({
    required: true,
    type: [Number],
  })
  @IsArray()
  @IsNotEmpty({ message: 'No topic id is provided' })
  public topic_id: number[];
}
