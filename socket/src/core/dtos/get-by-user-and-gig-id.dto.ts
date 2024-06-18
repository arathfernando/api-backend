import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class GetByGigIdDto {
  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  public gig_id: number;
}
