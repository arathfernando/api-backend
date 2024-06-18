import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export enum GIG_RESPONSE_STATUS {
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  PENDING = 'PENDING',
}

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
    description: 'reply_with_message',
    required: false,
  })
  @IsString()
  reply_with_message: string;

  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  link_attached: string;

  @ApiProperty({
    type: 'int',
    description: 'gig request id',
    required: true,
  })
  @IsNumber()
  request_id: number;

  @ApiProperty({
    required: false,
    enum: GIG_RESPONSE_STATUS,
  })
  @IsOptional()
  @IsEnum(GIG_RESPONSE_STATUS)
  response_status: GIG_RESPONSE_STATUS;
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
  reply_with_message: string;

  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  link_attached: string;

  @ApiProperty({
    type: 'int',
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
