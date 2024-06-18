import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserEmailDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'email not provided' })
  public new_email_address: string;
}
