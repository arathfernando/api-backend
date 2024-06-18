import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateFaqDto {
  @ApiProperty({ example: 'What is the deadline for the project?' })
  @IsNotEmpty()
  question: string;

  @ApiProperty({
    example: 'The deadline for the project is 2 weeks from the start date.',
  })
  @IsNotEmpty()
  answer: string;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  gig_id: number;
}
