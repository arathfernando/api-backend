import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { UpdatePackageDto } from './update-package.dto';
import { CreatePackageDto } from './create-package.dto';

export class PackageAllProcessDto {
  @ApiProperty({
    type: [CreatePackageDto],
    required: true,
  })
  @IsOptional()
  create_package: CreatePackageDto[];

  @ApiProperty({
    type: [UpdatePackageDto],
    required: false,
  })
  @IsOptional()
  update_package: UpdatePackageDto[];

  @ApiProperty({
    type: [Number],
    required: false,
  })
  @IsOptional()
  delete_package: number[];
}
