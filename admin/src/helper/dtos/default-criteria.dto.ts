import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { CreateDefaultCriteriaDto } from './create-default-criteria.dto';
import { UpdateDefaultCriteriaDto } from './update-default-criterial.dto';

export class DefaultCriteriaAllProcessDto {
  @ApiProperty({
    type: [CreateDefaultCriteriaDto],
    required: true,
  })
  @IsOptional()
  create_default_criteria: CreateDefaultCriteriaDto[];

  @ApiProperty({
    type: [UpdateDefaultCriteriaDto],
    required: false,
  })
  @IsOptional()
  update_default_criteria: UpdateDefaultCriteriaDto[];

  @ApiProperty({
    type: [Number],
    required: false,
  })
  @IsOptional()
  delete_default_criteria: number[];
}
