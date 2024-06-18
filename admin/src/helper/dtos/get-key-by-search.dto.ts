import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class GetKeyBySearch {
  @ApiProperty()
  @IsNumber()
  public project_id: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public language_code: string;
}
