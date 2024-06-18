import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GetBySlugDto {
  @ApiProperty()
  @IsString()
  public slug: string;
}
