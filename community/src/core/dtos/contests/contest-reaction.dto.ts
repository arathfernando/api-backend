import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class ContestReactionDto {
  @ApiProperty()
  @IsNumber()
  public contest_id: number;

  @ApiProperty()
  @IsNumber()
  public user_id: number;

  @ApiProperty({
    required: true,
  })
  @IsString()
  public reaction: string;
}

export class UpdateContestReactionDto {
  @ApiProperty()
  @IsNumber()
  public contest_id: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  public user_id: number;

  @ApiProperty({
    required: true,
  })
  @IsString()
  public reaction: string;
}
