import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ContestRevisionUploadDTO {
  @ApiProperty({
    required: true,
  })
  @IsString()
  public name: string;

  @ApiProperty({
    required: true,
  })
  @IsString()
  public description: string;

  @ApiProperty({
    required: true,
  })
  @IsString()
  public file_url: string;
}
