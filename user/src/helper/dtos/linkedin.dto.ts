import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LinkedinDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'No code provided' })
  public code: string;
}
