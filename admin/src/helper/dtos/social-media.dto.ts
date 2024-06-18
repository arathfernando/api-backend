import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SocialMediaDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty({ message: 'Please provide name' })
  public media_id: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Please provide link' })
  public link: string;
}
