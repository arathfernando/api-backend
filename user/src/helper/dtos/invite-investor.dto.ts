import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

export class InviteInvestorDto {
  @ApiProperty({
    required: true,
    isArray: true,
    type: [String],
  })
  @IsArray()
  public email: string[];
}
