import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { TRUE_FALSE } from '../constant';

export class updateUserDto {
  @ApiProperty({
    required: false,
    enum: TRUE_FALSE,
  })
  @IsOptional()
  @IsEnum(TRUE_FALSE)
  public is_completed_three_step_process: TRUE_FALSE;
}
