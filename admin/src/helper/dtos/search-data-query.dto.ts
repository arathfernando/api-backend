import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, IsNumber } from 'class-validator';
export enum GROUP_TYPE {
  GLOBAL = 'GLOBAL',
  ONLY_COMMUNITY = 'ONLY_COMMUNITY',
}

export class SearchDataQueryGroupDto {
  @ApiProperty({
    enum: GROUP_TYPE,
    required: false,
  })
  @IsOptional()
  public group_type: GROUP_TYPE;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Search is not provided' })
  public search: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public community_id: string;

  @ApiProperty()
  @IsNumber()
  public page: number;

  @ApiProperty()
  @IsNumber()
  public limit: number;
}
