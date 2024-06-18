import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class SearchDatasDto {
  @ApiProperty()
  @IsNumber()
  public page: number;

  @ApiProperty()
  @IsNumber()
  public limit: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public search: string;
}
