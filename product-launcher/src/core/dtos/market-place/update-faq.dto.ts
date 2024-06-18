import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class UpdateFaqDto {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsNumber()
  gig_id: number;

  @ApiProperty({ example: 'What is the deadline for the project?' })
  @IsOptional()
  question: string;

  @ApiProperty({
    example: 'The deadline for the project is 2 weeks from the start date.',
  })
  @IsOptional()
  answer: string;
}
