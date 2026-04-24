import { Uuid } from '@/common/types/common.type';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  TransactionDirection,
  TransactionMethod,
  TransactionStatus,
  TransactionType,
} from '../entities/transaction.entity';

export class TransactionResDto {
  @ApiProperty() @Expose() id!: Uuid;
  @ApiProperty() @Expose() orderId!: Uuid;
  @ApiPropertyOptional() @Expose() orderCode?: string;
  @ApiProperty({ enum: TransactionType }) @Expose() type!: TransactionType;
  @ApiPropertyOptional({ enum: TransactionMethod })
  @Expose()
  method: TransactionMethod | null;
  @ApiProperty() @Expose() amount!: number;
  @ApiProperty({ enum: TransactionDirection })
  @Expose()
  direction!: TransactionDirection;
  @ApiProperty({ enum: TransactionStatus })
  @Expose()
  status!: TransactionStatus;
  @ApiPropertyOptional() @Expose() referenceNo: string | null;
  @ApiPropertyOptional() @Expose() referenceNote: string | null;
  @ApiProperty() @Expose() occurredAt!: Date;
  @ApiPropertyOptional() @Expose() createdByAdminId: Uuid | null;
  @ApiProperty() @Expose() createdAt!: Date;
  @ApiProperty() @Expose() updatedAt!: Date;
}
