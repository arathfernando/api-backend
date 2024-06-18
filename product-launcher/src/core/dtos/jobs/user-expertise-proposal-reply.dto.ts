import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserExpertiseProposalReplyDTO {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  user_id: number;

  @ApiProperty({ type: 'string' })
  @IsString()
  message: string;
}

export class UpdateUserExpertiseProposalReplyDTO {
  @ApiProperty({ example: 1, required: false })
  @IsNotEmpty()
  @IsOptional()
  user_id: number;

  @ApiProperty({ type: 'string', required: false })
  @IsString()
  @IsOptional()
  message: string;
}
