import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateTestNotificationDto {
  @ApiProperty({
    required: true,
  })
  @IsNumber()
  public notification_from: number;

  @ApiProperty({
    required: true,
  })
  @IsNumber()
  notification_to: number;

  @ApiProperty({
    required: true,
  })
  @IsString()
  content: string;

  @ApiProperty({
    required: true,
  })
  @IsString()
  payload: string;

  @ApiProperty({
    required: true,
  })
  @IsString()
  type: string;
}
