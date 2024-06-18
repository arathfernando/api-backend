import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { TOPIC_STATUS } from '../constant';

export class UpdateTopicDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty({
    enum: TOPIC_STATUS,
    required: false,
  })
  @IsOptional()
  @IsEnum(TOPIC_STATUS)
  public status: TOPIC_STATUS;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  created_by: number;
}
