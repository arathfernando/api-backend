import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FILE_UPLOAD_BY } from '../../constant/enum.constant';

export class CreateJobFilesDTO {
  @ApiProperty({ type: 'number', example: 1 })
  @IsNumber()
  job_id: number;

  @ApiProperty({ type: 'number', example: 1 })
  @IsNumber()
  upload_to: number;

  @ApiProperty({
    required: true,
    enum: FILE_UPLOAD_BY,
  })
  @IsEnum(FILE_UPLOAD_BY)
  file_upload_by: FILE_UPLOAD_BY;

  @ApiProperty({
    required: false,
    type: [String],
  })
  @IsOptional()
  attachments: string[];
}

export class UpdateJobFilesDTO {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  job_id: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  upload_to: number;

  @ApiProperty({
    required: true,
    enum: FILE_UPLOAD_BY,
  })
  @IsEnum(FILE_UPLOAD_BY)
  file_upload_by: FILE_UPLOAD_BY;

  @ApiProperty({
    required: false,
    type: [String],
  })
  @IsOptional()
  attachments: string[];
}
