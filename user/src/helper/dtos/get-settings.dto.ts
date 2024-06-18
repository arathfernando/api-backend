import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

export class GetSettingDto {
  @ApiProperty({
    required: true,
    type: [String],
    isArray: true,
  })
  @IsArray()
  public settings: string[];
}
