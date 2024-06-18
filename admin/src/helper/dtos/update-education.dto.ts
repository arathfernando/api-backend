import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';
import { EducationDto } from './education.dto';

export class UpdateEducationDto {
  @ApiProperty({
    required: true,
    isArray: true,
    type: EducationDto,
  })
  @IsArray()
  public education: EducationDto;
}
