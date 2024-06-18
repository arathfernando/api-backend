import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class UpdateFeedbackDto {
  @ApiProperty({ example: 'Message', required: false })
  @IsOptional()
  message: string;

  @ApiProperty({ example: 'Title', required: false })
  @IsOptional()
  title: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  gig_id: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  delivery_rating: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  expertise_content_rating: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  over_all_rating: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  results_rating: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  created_by: number;
}
