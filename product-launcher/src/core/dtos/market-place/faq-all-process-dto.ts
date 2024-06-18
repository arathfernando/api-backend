import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { CreateFaqDto } from './create-faq.dto';
import { UpdateFaqDto } from './update-faq.dto';

export class FaqAllProcessDto {
  @ApiProperty({
    type: [CreateFaqDto],
    required: true,
  })
  @IsOptional()
  create_faq: CreateFaqDto[];

  @ApiProperty({
    type: [UpdateFaqDto],
    required: false,
  })
  @IsOptional()
  update_faq: UpdateFaqDto[];

  @ApiProperty({
    type: [Number],
    required: false,
  })
  @IsOptional()
  delete_faq: number[];
}
