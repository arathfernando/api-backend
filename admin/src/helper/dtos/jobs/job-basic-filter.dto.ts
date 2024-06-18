import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export enum JOB_STATUS {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export class JobFilterDTO {
  @ApiProperty({
    required: true,
    enum: JOB_STATUS,
  })
  @IsOptional()
  @IsEnum(JOB_STATUS)
  status: JOB_STATUS;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public search: string;

  @ApiProperty()
  @IsNumber()
  public page: number;

  @ApiProperty()
  @IsNumber()
  public limit: number;
}
