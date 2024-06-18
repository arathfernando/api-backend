import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SearchUserDto {
  @ApiProperty({
    required: true,
  })
  @IsString()
  public search: string;
}
