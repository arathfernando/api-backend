import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CommunitySearchDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'No name is provided' })
  public name: string;
}
