import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateUserExpertiseReviewDTO {
  @ApiProperty()
  @IsNumber()
  over_all_rating: number;

  @ApiProperty()
  @IsNumber()
  results: number;

  @ApiProperty()
  @IsNumber()
  delivery: number;

  @ApiProperty()
  @IsNumber()
  expertise_content: number;

  @ApiProperty()
  @IsNumber()
  expertise_user_id: number;

  @ApiProperty()
  @IsNumber()
  proposal_id: number;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  comment: string;
}

export class UpdateUserExpertiseReviewDTO {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  over_all_rating: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  results: number;

  @ApiProperty()
  @IsNumber()
  expertise_user_id: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  delivery: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  expertise_content: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  proposal_id: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  title: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  comment: string;
}
