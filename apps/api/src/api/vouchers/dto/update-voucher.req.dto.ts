import {
  BooleanFieldOptional,
  DateFieldOptional,
  EnumFieldOptional,
  NumberFieldOptional,
  StringFieldOptional,
} from '@/decorators/field.decorators';
import { DiscountType } from '../entities/voucher.entity';

export class UpdateVoucherReqDto {
  @StringFieldOptional({ maxLength: 50, toUpperCase: true })
  code?: string;

  @StringFieldOptional({ maxLength: 255 })
  description?: string;

  @EnumFieldOptional(() => DiscountType)
  discountType?: DiscountType;

  @NumberFieldOptional({ int: true, min: 1 })
  discountValue?: number;

  @NumberFieldOptional({ int: true, min: 0, nullable: true })
  minOrderAmount?: number | null;

  @NumberFieldOptional({ int: true, min: 1, nullable: true })
  maxUses?: number | null;

  @BooleanFieldOptional()
  isActive?: boolean;

  @DateFieldOptional({ nullable: true })
  expiresAt?: Date | null;
}
