import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ProfileTypeDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  public title: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  public description: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  public color: string;
}
