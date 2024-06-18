import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber } from 'class-validator';
import { UPDATE_ORDER } from '../constant';

export class UpdateOrderDTO {
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

  @ApiProperty({
    enum: UPDATE_ORDER,
    required: true,
  })
  @IsEnum(UPDATE_ORDER)
  public update_order_for: UPDATE_ORDER;
}
