import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { POST_LOCATION } from 'src/core/constant/enum.constant';
import { PollOptionDto } from './poll-question.dto';

export class UpdatePollDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public description: string;

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
  public question: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public topics: string;

  @ApiProperty({
    enum: POST_LOCATION,
    required: false,
  })
  @IsOptional()
  @IsEnum(POST_LOCATION)
  public post_location: POST_LOCATION;
}
