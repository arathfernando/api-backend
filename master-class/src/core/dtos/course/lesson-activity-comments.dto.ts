import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateLessonActivityCommentDto {
  @ApiProperty()
  @IsNumber()
  lesson_activity_id: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  public parent_comment_id: number;

  @ApiProperty()
  @IsString()
  comment: string;
}

export class UpdateLessonActivityCommentDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  lesson_activity_id: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  comment: string;
}
