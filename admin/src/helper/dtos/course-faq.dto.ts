import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber } from 'class-validator';
export class faqs {
  @ApiProperty()
  question: string;

  @ApiProperty()
  answer: string;
}

export class QuestionAnswerDto {
  @ApiProperty()
  @IsNumber()
  course_id: number;

  @ApiProperty()
  @IsNumber()
  created_by: number;

  @ApiProperty({
    type: [faqs],
  })
  @IsArray()
  public faq: faqs;
}
