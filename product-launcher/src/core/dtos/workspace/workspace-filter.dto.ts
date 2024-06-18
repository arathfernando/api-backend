import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { INVITE_STATUS } from 'src/core/constant/enum.constant';

export class WorkspaceFilterDTO {
  @ApiProperty({
    required: false,
    enum: INVITE_STATUS,
  })
  @IsOptional()
  @IsEnum(INVITE_STATUS)
  @IsNotEmpty({ message: 'workspace member status is not provided.' })
  invite_status: INVITE_STATUS;
}
