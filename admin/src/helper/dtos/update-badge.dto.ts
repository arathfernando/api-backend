import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateBadgeDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Badge name is not provided' })
  public badge_name: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Badge category is not provided' })
  public badge_category: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  public badge_image: Express.Multer.File;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public level: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public hbb_points: string;
}
