import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetTopicDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'No name is provided' })
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'No display name is provided' })
  display_name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Description is not provided' })
  description: string;
}
