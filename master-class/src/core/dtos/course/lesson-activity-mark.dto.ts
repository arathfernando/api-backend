import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { SEEN_UNSEEN } from 'src/core/constant/enum.constant';
export class CreateLessonActivityMarkDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty({ message: 'lesson activity id not provided' })
  public lesson_activity_id: number;

  @ApiProperty({
    required: true,
    enum: SEEN_UNSEEN,
  })
  @IsEnum(SEEN_UNSEEN)
  public seen_unseen: SEEN_UNSEEN;
}

export class UpdateLessonActivityMarkDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsNotEmpty({ message: 'lesson activity id not provided' })
  public lesson_activity_id: number;

  @ApiProperty({
    required: false,
    enum: SEEN_UNSEEN,
  })
  @IsOptional()
  @IsEnum(SEEN_UNSEEN)
  public seen_unseen: SEEN_UNSEEN;
}
