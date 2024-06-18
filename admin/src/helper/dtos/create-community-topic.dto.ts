import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { TOPIC_LOCATION } from '../constant';

export class CreateTopicDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty({ message: 'Community/Group id is not provided' })
  public id: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'No name is provided' })
  name: string;

  @ApiProperty({
    enum: TOPIC_LOCATION,
    required: true,
  })
  @IsEnum(TOPIC_LOCATION)
  public topic_location: TOPIC_LOCATION;

  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty()
  @IsNumber()
  created_by: number;
}
