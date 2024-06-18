import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { GROUP_TYPE } from 'src/core/constant/enum.constant';
export class GroupTypeDto {
  @ApiProperty({
    required: true,
    enum: GROUP_TYPE,
  })
  @IsEnum(GROUP_TYPE)
  @IsNotEmpty({ message: 'Group type is not provided.' })
  group_type: GROUP_TYPE;
}
