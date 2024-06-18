import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LanguageLevelDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Language Level Name not provided' })
  public language_level_name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Description is not provided' })
  public description: string;
}
