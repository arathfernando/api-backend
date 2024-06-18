import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { POLL_STATUS, POST_LOCATION } from 'src/core/constant/enum.constant';
import { PollOptionDto } from './poll-question.dto';

export class CreatePollDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty({ message: 'Community/Group id is not provided' })
  public id: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public description: string;

  @ApiProperty({
    required: true,
  })
  @IsString()
  public question: string;

  @ApiProperty({
    required: true,
    type: PollOptionDto,
    isArray: true,
  })
  @IsArray()
  public options: PollOptionDto[];

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public topics: string;

  @ApiProperty({
    enum: POST_LOCATION,
    required: true,
  })
  @IsEnum(POST_LOCATION)
  public post_location: POST_LOCATION;

  @ApiProperty({
    enum: POLL_STATUS,
    required: true,
  })
  @IsEnum(POLL_STATUS)
  public poll_status: POLL_STATUS;
}
