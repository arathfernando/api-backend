import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty, IsString } from 'class-validator';

export class CreateTopicAssignDto {
  @ApiProperty({
    required: true,
  })
  @IsNumber()
  @IsNotEmpty({ message: 'No community id is provided' })
  public community_id: number;

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
