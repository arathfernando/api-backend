import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class SearchDataDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  public search: string;
}
