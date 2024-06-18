import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class GetByIdDto {
  @ApiProperty()
  @IsNumber()
  public id: number;
}
