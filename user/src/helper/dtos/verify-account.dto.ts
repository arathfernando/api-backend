import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyAccountDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Token is not provided' })
  public token: string;
}
