import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SearchDataDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Search is not provided' })
  public search: string;
}
