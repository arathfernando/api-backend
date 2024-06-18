import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserPasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'current password not provided' })
  public current_password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'new password not provided' })
  public new_password: string;
}
