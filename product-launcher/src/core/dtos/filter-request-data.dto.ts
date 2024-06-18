import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import {
  GIG_REQUEST_RESPONSE_STATUS,
  GIG_REQUEST_STATE,
  GIG_REQUEST_STATUS,
} from '../constant/enum.constant';

export class FilterRequestDataDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public search: string;

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
}
