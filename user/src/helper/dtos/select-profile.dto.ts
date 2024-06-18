import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';
import { PROFILE_TYPES } from '../constant';

export class SelectProfileDto {
  @ApiProperty({
    isArray: true,
    required: true,
    enum: PROFILE_TYPES,
  })
  @IsArray()
  public profile_types: PROFILE_TYPES[];
}
