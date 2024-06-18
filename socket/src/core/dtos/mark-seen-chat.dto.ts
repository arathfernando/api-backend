import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber } from 'class-validator';

export class markAsSeenDto {
  @ApiProperty({
    required: true,
    type: [Number],
  })
  @IsArray()
  public id: number[];
}
