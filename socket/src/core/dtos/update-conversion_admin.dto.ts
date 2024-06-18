import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class UpdateConversionAdminDto {
  @ApiProperty({
    required: true,
  })
  @IsNumber()
  public conversation_id: number;

  @ApiProperty({
    required: true,
  })
  @IsNumber()
  public user_id: number;
}
