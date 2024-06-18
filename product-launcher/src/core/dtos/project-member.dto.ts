import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber } from 'class-validator';

export class ProjectMemberDto {
  @ApiProperty()
  @IsNumber()
  project_id: number;

  @ApiProperty()
  @IsArray()
  public user_id: number[];
}
