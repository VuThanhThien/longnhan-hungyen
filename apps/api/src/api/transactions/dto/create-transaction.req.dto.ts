import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import {
  TransactionMethod,
  TransactionStatus,
  TransactionType,
} from '../entities/transaction.entity';

export class CreateTransactionReqDto {
  @ApiProperty({ enum: TransactionType })
  @IsEnum(TransactionType)
  type!: TransactionType;

  /** Required when type is `payment` or `refund`; optional otherwise. */
  @ApiPropertyOptional({ enum: TransactionMethod })
  @IsOptional()
  @IsEnum(TransactionMethod)
  method?: TransactionMethod;

  @ApiProperty({ minimum: 1 })
  @IsInt()
  @Min(1)
  amount!: number;

  @ApiPropertyOptional({ enum: TransactionStatus })
  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @ApiPropertyOptional({ maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  referenceNo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  referenceNote?: string;

  @ApiProperty({
    description: 'ISO-8601 timestamp; rejected if > 7 days in future',
  })
  @IsDateString()
  occurredAt!: string;
}
