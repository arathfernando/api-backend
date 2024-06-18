import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class GetByIdOptionalDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  public id: number;
}
