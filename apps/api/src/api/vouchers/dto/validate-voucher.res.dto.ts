import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { DiscountType } from '../entities/voucher.entity';

export class ValidateVoucherResDto {
  @ApiProperty()
  @Expose()
  valid!: boolean;

  @ApiPropertyOptional({ enum: DiscountType })
  @Expose()
  discountType?: DiscountType;

  @ApiPropertyOptional()
  @Expose()
  discountValue?: number;

  @ApiProperty()
  @Expose()
  discountAmount!: number;

  @ApiProperty()
  @Expose()
  finalTotal!: number;

  @ApiPropertyOptional()
  @Expose()
  message?: string;
}
