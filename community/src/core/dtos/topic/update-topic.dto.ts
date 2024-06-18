import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TOPIC_TYPE } from 'src/core/constant/enum.constant';

export class UpdateTopicDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  display_name: string;

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
  description: string;

  @ApiProperty({
    enum: TOPIC_TYPE,
    required: false,
  })
  @IsOptional()
  @IsEnum(TOPIC_TYPE)
  public topic_type: TOPIC_TYPE;
}
