import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateSocialMediaDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Please provide link' })
  public link: string;
}
