import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class TeacherPaginationDto {
  @ApiProperty()
  @IsNumber()
  public teacher_file_assignment_id: number;

  @ApiProperty()
  @IsNumber()
  public page: number;

  @ApiProperty()
  @IsNumber()
  public limit: number;
}
