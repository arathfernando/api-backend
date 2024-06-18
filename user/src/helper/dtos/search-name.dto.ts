import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SearchNameDto {
  @ApiProperty()
  @IsString()
  public name: string;
}
