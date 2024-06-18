import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class SearchChatDto {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  @IsNumber()
  public conversation_id: number;

  @ApiProperty({
    required: true,
  })
  @IsOptional()
  public message: string;

  @ApiProperty()
  @IsNumber()
  public page: number;

  @ApiProperty()
  @IsNumber()
  public limit: number;
}
