import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateBasicTypeDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public name: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  public category: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public description: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  public image: Express.Multer.File;
}
