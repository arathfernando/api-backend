import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { GIG_RESPONSE_STATUS } from 'src/core/constant/enum.constant';

export class CreateRequestResponseDto {
  @IsArray()
  @ApiProperty({ example: ['src', 'src'] })
  attachments: string[];

  @ApiProperty({
    type: 'string',
    description: 'message',
    required: false,
  })
  @IsOptional()
  @IsString()
  message: string;

  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  link_attached: string;

  @ApiProperty({
    description: 'gig request id',
    required: true,
  })
  @IsNumber()
  request_id: number;
}

export class UpdateRequestResponseDto {
  @IsArray()
  @ApiProperty({ example: ['src', 'src'], required: false })
  @IsOptional()
  attachments: string[];

  @ApiProperty({
    type: 'string',
    description: 'message',
    required: false,
  })
  @IsOptional()
  @IsString()
  message: string;

  @ApiProperty({
    type: 'string',
    description: 'reply_with_message',
    required: false,
  })
  @IsString()
  @IsOptional()
  reply_with_message: string;

  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  link_attached: string;

  @ApiProperty({
    description: 'gig request id',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  request_id: number;

  @ApiProperty({
    enum: GIG_RESPONSE_STATUS,
    required: false,
  })
  @IsOptional()
  response_status: GIG_RESPONSE_STATUS;
}
