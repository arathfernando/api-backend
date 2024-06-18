import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AppleDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'No code provided' })
  public code: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'No first-name provided' })
  public first_name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'No last-name provided' })
  public last_name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'No email provided' })
  public email: string;
}
