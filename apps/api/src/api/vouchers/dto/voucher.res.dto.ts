import { Uuid } from '@/common/types/common.type';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { DiscountType } from '../entities/voucher.entity';

export class VoucherResDto {
  @ApiProperty()
  @Expose()
  id!: Uuid;

  @ApiProperty()
  @Expose()
  code!: string;

  @ApiPropertyOptional()
  @Expose()
  description: string | null;

  @ApiProperty({ enum: DiscountType })
  @Expose()
  discountType!: DiscountType;

  @ApiProperty()
  @Expose()
  discountValue!: number;

  @ApiPropertyOptional()
  @Expose()
  minOrderAmount: number | null;

  @ApiPropertyOptional()
  @Expose()
  maxUses: number | null;

  @ApiProperty()
  @Expose()
  usedCount!: number;

  @ApiProperty()
  @Expose()
  isActive!: boolean;

  @ApiPropertyOptional()
  @Expose()
  expiresAt: Date | null;

  @ApiProperty()
  @Expose()
  createdAt!: Date;

  @ApiProperty()
  @Expose()
  updatedAt!: Date;
}
