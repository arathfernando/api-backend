import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class GetUsersForSiteDto {
  @ApiProperty()
  @IsNumber()
  public limit: number;
}
