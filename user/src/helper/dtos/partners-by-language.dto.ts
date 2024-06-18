import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class PartnersByLanguageDto {
  @ApiProperty({
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'No language code provided' })
  public language_code: string;
}
