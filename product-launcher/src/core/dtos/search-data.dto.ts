import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SearchDataDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public search: string;
}
