import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';
export class faqs {
  @ApiProperty()
  question: string;

  @ApiProperty()
  answer: string;
}

export class UpdateQuestionAnswerDto {
  @ApiProperty({
    type: [faqs],
  })
  @IsArray()
  public faq: faqs[];
}
