import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GrabShareDTO {
  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'No message provided.' })
  public message: string;

  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'No name provided.' })
  public name: string;

  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'No e-mail provided.' })
  public email: string;
}
