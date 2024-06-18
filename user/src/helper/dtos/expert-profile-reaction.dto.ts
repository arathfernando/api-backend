import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateExpertProfileReactionDto {
  @ApiProperty({ example: 'Reaction' })
  @IsNotEmpty()
  reaction: string;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  expert_id: number;
}

export class UpdateExpertProfileReactionDto {
  @ApiProperty({ example: 'Reaction', required: false })
  @IsOptional()
  reaction: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  expert_id: number;
}
