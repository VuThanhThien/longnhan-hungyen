import { PageOptionsDto } from '@/common/dto/offset-pagination/page-options.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import {
  TransactionMethod,
  TransactionStatus,
  TransactionType,
} from '../entities/transaction.entity';

export class TransactionQueryReqDto extends PageOptionsDto {
  @ApiPropertyOptional({ enum: TransactionType })
  @IsOptional()
  @IsEnum(TransactionType)
  readonly type?: TransactionType;

  @ApiPropertyOptional({ enum: TransactionMethod })
  @IsOptional()
  @IsEnum(TransactionMethod)
  readonly method?: TransactionMethod;

  @ApiPropertyOptional({ enum: TransactionStatus })
  @IsOptional()
  @IsEnum(TransactionStatus)
  readonly status?: TransactionStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  readonly dateFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  readonly dateTo?: string;
}
