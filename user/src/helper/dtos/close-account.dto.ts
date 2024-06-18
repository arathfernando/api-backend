import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CloseAccountDto {
  @ApiProperty({
    required: true,
  })
  @IsString()
  public reason: string;

  @ApiProperty({
    required: false,
  })
  @IsString()
  public feedback: string;
}
