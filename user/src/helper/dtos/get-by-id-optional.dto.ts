import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class GetByIdOptionalDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  // @IsNumber()
  public user_id: number;
}
