import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateNationalityDto {
  @ApiProperty()
  @IsString()
  nationality: string;
}

export class UpdateNationalityDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  nationality?: string;
}
