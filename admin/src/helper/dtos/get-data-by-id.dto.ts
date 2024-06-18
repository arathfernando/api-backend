import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class GetDataByIdDto {
  @ApiProperty({ required: false })
  @IsOptional()
  public id: number;
}
