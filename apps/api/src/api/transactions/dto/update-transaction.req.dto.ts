import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { TransactionStatus } from '../entities/transaction.entity';

/** Whitelist: only status / reference fields / occurredAt mutable. Ledger integrity. */
export class UpdateTransactionReqDto {
  @ApiPropertyOptional({ enum: TransactionStatus })
  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @ApiPropertyOptional({ maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  referenceNo?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  referenceNote?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  occurredAt?: string;
}
