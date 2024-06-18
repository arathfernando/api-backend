import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class UpdateHubbersTeamProfileOrderDto {
  @ApiProperty({
    required: true,
  })
  @IsNumber()
  public base_id: number;

  @ApiProperty({
    required: true,
  })
  @IsNumber()
  public update_id: number;
}
