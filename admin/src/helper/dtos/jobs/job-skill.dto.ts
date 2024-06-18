import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateJobSkillDTO {
  @ApiProperty({
    required: true,
  })
  @IsNumber()
  public created_by: number;

  @ApiProperty({
    required: true,
    isArray: true,
    type: [String],
  })
  @IsArray()
  public skill: string[];
}

export class UpdateJobSkillDTO {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  public created_by: number;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  skill: string;
}
