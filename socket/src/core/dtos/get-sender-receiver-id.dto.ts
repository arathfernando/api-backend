import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class GetSenderReceiverDto {
  @ApiProperty()
  @IsNumber()
  public from_id: number;

  @ApiProperty()
  @IsNumber()
  public to_id: number;
}
