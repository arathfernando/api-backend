import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateReactionDto {
  @ApiProperty({ example: 'Reaction' })
  @IsNotEmpty()
  reaction: string;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  gig_id: number;
}

export class UpdateReactionDto {
  @ApiProperty({ example: 'Reaction', required: false })
  @IsOptional()
  reaction: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  gig_id: number;
}
