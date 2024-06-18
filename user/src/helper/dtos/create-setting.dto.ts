import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';
import { SaveSettingDto } from './save-setting.dto';

export class CreateSettingDto {
  @ApiProperty({
    required: true,
    type: SaveSettingDto,
    isArray: true,
  })
  @IsArray()
  public settings: SaveSettingDto[];
}
