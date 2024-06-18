import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class BasicTypeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Name not provided' })
  public name: string;

  @ApiProperty({
    required: true,
  })
  @IsNumber()
  public category: number;

  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
  public description: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  public image: Express.Multer.File;
}
