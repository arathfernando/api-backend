import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ContestMarksDto {
  @ApiProperty({
    required: true,
  })
  @IsString()
  public title: string;

  @ApiProperty({
    required: true,
  })
  @IsString()
  public mark: string;
}
