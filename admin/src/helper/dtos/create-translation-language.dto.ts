import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTranslationLanguageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Language Code not provided' })
  public language_code: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Language Name is not provided' })
  public language_name: string;

  @ApiProperty({ type: 'string', format: 'binary', required: true })
  public flag: Express.Multer.File;
}
