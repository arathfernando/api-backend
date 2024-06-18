import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateJobReactionDto {
  @ApiProperty({ example: 'Reaction' })
  @IsNotEmpty()
  reaction: string;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  job_id: number;
}

export class UpdateJobReactionDto {
  @ApiProperty({ example: 'Reaction', required: false })
  @IsOptional()
  reaction: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  job_id: number;
}
