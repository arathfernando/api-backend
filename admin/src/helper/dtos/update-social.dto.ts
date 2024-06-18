import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateSocialDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public name: string;

  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
  public description: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  public image: Express.Multer.File;
}
