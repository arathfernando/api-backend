import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateGoalDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public goal_title: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  public goal_image: Express.Multer.File;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public color: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsString()
  public description: string;

  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  public goal_number: number;
}
