import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateTranslationLanguageDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public language_code: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public language_name: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  public flag: Express.Multer.File;
}
