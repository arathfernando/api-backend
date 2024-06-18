import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ANALYTICS_TRANSACTION_TYPE } from '../constant/enum.constant';

export class GetAnalyticsByTransactionTypeDto {
  @ApiProperty({
    required: true,
    enum: ANALYTICS_TRANSACTION_TYPE,
  })
  @IsEnum(ANALYTICS_TRANSACTION_TYPE)
  public transaction_type: ANALYTICS_TRANSACTION_TYPE;
}
