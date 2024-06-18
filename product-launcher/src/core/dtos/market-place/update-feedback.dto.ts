import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateFeedbackDto {
  @ApiProperty({ example: 'Message', required: false })
  @IsNotEmpty()
  @IsOptional()
  message: string;

  @ApiProperty({ example: 'Title', required: false })
  @IsNotEmpty()
  @IsOptional()
  title: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNotEmpty()
  gig_id: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNotEmpty()
  delivery_rating: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNotEmpty()
  expertise_content_rating: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNotEmpty()
  over_all_rating: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNotEmpty()
  results_rating: number;
}
