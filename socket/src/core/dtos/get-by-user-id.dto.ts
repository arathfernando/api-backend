import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class GetByUserIdDto {
  @ApiProperty()
  @IsNumber()
  public user_id: number;
}
