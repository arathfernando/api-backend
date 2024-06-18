import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';
import { ContestOwnCriteriaSubmissionDTO } from './contest-own-criteria-submission.dto';
import { ContestRevisionUploadDTO } from './contest-revision-upload.dto';

export class ContestSubmissionDto {
  @ApiProperty({
    required: true,
  })
  @IsString()
  public describe_entry: string;

  @ApiProperty({
    required: true,
    isArray: true,
    type: ContestOwnCriteriaSubmissionDTO,
  })
  @IsArray()
  public contest_own_criteria: ContestOwnCriteriaSubmissionDTO[];

  @ApiProperty({
    required: true,
    isArray: true,
    type: ContestRevisionUploadDTO,
  })
  @IsArray()
  public contest_revision_upload: ContestRevisionUploadDTO[];
}
