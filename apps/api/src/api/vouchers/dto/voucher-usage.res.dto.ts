import { Uuid } from '@/common/types/common.type';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class VoucherUsageResDto {
  @ApiProperty()
  @Expose()
  id!: Uuid;

  @ApiProperty()
  @Expose()
  voucherId!: Uuid;

  @ApiProperty()
  @Expose()
  orderId!: Uuid;

  /** Phone masked: first 3 + last 2 digits visible, middle replaced with *** */
  @ApiProperty()
  @Expose()
  phoneMasked!: string;

  @ApiProperty()
  @Expose()
  discountAmount!: number;

  @ApiProperty()
  @Expose()
  usedAt!: Date;
}
