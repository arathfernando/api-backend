import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateChatDto {
  @ApiProperty({
    required: true,
  })
  @IsNumber()
  public sender: number;

  @ApiProperty({
    required: true,
  })
  @IsNumber()
  recipient: number;

  @ApiProperty({
    required: true,
  })
  @IsString()
  message: string;
}
