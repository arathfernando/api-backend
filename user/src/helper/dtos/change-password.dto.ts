import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'New password not provided' })
  public new_password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Token not provided' })
  public token: string;
}
