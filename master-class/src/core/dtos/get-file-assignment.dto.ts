import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class fileAssignmentGetDto {
  @ApiProperty()
  @IsNumber()
  public teacher_file_assignment_id: number;

  @ApiProperty()
  @IsNumber()
  public course_id: number;

  @ApiProperty()
  @IsNumber()
  public user_id: number;
}
