import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

enum UPDATE_GROUP_STATUS {
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}
export class UpdateGroupStatusDto {
  @IsEnum(UPDATE_GROUP_STATUS)
  @ApiProperty({
    enum: UPDATE_GROUP_STATUS,
    required: true,
  })
  public status: UPDATE_GROUP_STATUS;
}
