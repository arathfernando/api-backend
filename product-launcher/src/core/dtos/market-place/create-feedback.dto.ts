import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateFeedbackDto {
  @ApiProperty({ example: 'Message' })
  @IsNotEmpty()
  message: string;

  @ApiProperty({ example: 'Title' })
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  gig_id: number;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  delivery_rating: number;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  expertise_content_rating: number;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  over_all_rating: number;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  results_rating: number;
}
