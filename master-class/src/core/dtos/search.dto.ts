import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SearchDto {
  @ApiProperty()
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public search: string;
}
