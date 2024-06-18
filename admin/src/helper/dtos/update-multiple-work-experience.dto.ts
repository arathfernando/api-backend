import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';
import { WorkExperienceDto } from './work-experience.dto';

export class UpdateWorkExpDto {
  @ApiProperty({
    required: true,
    isArray: true,
    type: WorkExperienceDto,
  })
  @IsArray()
  public work_experience: WorkExperienceDto;
}
