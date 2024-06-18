import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber } from 'class-validator';

export class Faq {
  @ApiProperty()
  @IsNumber()
  public product_category: number;

  @ApiProperty()
  @IsNumber()
  public product_sub_category: number;

  @ApiProperty()
  @IsNumber()
  public product_sub_faq: number;

  @ApiProperty()
  @IsNumber()
  public product_sub_faq_ans: string;
}

export class AssessmentDto {
  @ApiProperty()
  @IsNumber()
  project_id: number;

  @ApiProperty({
    type: [Faq],
  })
  @IsArray()
  public faq: Faq;
}
