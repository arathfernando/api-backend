import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class InviteSearchDataDto {
  @ApiProperty()
  @IsNumber()
  public page: number;

  @ApiProperty()
  @IsNumber()
  public limit: number;
}
