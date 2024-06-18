import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class MergeAccountDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'User is not provided' })
  public email: string;

  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'No password provided' })
  public password: string;
}
