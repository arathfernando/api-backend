import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserFcmTokenDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'token not provided' })
  public token: string;
}
