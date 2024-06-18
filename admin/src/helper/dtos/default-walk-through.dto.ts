import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { CreateWalkthroughCategoryDto } from './walkthrough-category.dto';
import { UpdateWalkthroughCategoryDto } from './update-default-walkthrough-category.dto';

export class WalkthroughCategoryAllProcessDto {
  @ApiProperty({
    type: [CreateWalkthroughCategoryDto],
    required: true,
  })
  @IsOptional()
  create_walkthrough_category: CreateWalkthroughCategoryDto[];

  @ApiProperty({
    type: [UpdateWalkthroughCategoryDto],
    required: false,
  })
  @IsOptional()
  update_walkthrough_category: UpdateWalkthroughCategoryDto[];

  @ApiProperty({
    type: [Number],
    required: false,
  })
  @IsOptional()
  delete_walkthrough_category: number[];
}
