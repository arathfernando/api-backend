import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class ReportPostCommentDto {
  @ApiProperty({
    required: true,
  })
  @IsNumber()
  public comment_id: number;

  @ApiProperty({
    required: true,
  })
  @IsString()
  public reason: string;
}
