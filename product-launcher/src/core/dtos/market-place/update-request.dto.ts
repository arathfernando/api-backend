import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  GIG_REQUEST_RESPONSE_STATUS,
  GIG_REQUEST_STATE,
  GIG_REQUEST_STATUS,
} from 'src/core/constant/enum.constant';

export class UpdateRequestDto {
  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  public attachment: Express.Multer.File;

  @ApiProperty({
    type: 'string',
    description: 'description',
    required: false,
  })
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty({
    type: 'string',
    description: 'message',
    required: false,
  })
  @IsOptional()
  @IsString()
  message: string;

  @ApiProperty({
    required: false,
    example: GIG_REQUEST_STATUS.PENDING,
    enum: GIG_REQUEST_STATUS,
  })
  @IsOptional()
  @IsEnum(GIG_REQUEST_STATUS, { message: 'Invalid GIG_REQUEST_STATUS value' })
  status: GIG_REQUEST_STATUS;

  @ApiProperty({
    required: false,
    example: GIG_REQUEST_STATE.NEW,
    enum: GIG_REQUEST_STATE,
  })
  @IsOptional()
  @IsEnum(GIG_REQUEST_STATE, { message: 'Invalid GIG_REQUEST_STATUS value' })
  state: GIG_REQUEST_STATE;

  @ApiProperty({
    required: false,
    example: GIG_REQUEST_RESPONSE_STATUS.NOT_SENT,
    enum: GIG_REQUEST_RESPONSE_STATUS,
  })
  @IsOptional()
  @IsEnum(GIG_REQUEST_RESPONSE_STATUS, {
    message: 'Invalid GIG_REQUEST_RESPONSE_STATUS value',
  })
  request_response_status: GIG_REQUEST_RESPONSE_STATUS;

  @ApiProperty({
    type: 'string',
    description: 'budget for service',
    required: false,
  })
  @IsOptional()
  @IsString()
  budget_for_service: string;

  @ApiProperty({
    type: 'int',
    description: 'gig package id',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  gig_package_id: number;
}
