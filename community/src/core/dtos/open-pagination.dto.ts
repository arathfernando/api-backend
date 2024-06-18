import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class OpenPaginationDto {
  @ApiProperty()
  @IsNumber()
  public id: number;

  @ApiProperty()
  @IsNumber()
  public page: number;

  @ApiProperty()
  @IsNumber()
  public limit: number;
}
