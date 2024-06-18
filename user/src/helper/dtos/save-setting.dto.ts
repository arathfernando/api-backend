import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class SaveSettingDto {
  @ApiProperty({
    required: true,
  })
  @IsString()
  public setting_key: string;

  @ApiProperty({
    required: true,
  })
  @IsArray()
  public setting_value: string;
}
