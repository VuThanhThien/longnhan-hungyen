import {
  BooleanFieldOptional,
  DateFieldOptional,
  EnumField,
  NumberField,
  NumberFieldOptional,
  StringField,
  StringFieldOptional,
} from '@/decorators/field.decorators';
import { DiscountType } from '../entities/voucher.entity';

export class CreateVoucherReqDto {
  @StringField({ maxLength: 50, toUpperCase: true })
  code!: string;

  @StringFieldOptional({ maxLength: 255 })
  description?: string;

  @EnumField(() => DiscountType)
  discountType!: DiscountType;

  /** Percent (1-100) or VND amount */
  @NumberField({ int: true, min: 1 })
  discountValue!: number;

  @NumberFieldOptional({ int: true, min: 0 })
  minOrderAmount?: number;

  /** null = unlimited */
  @NumberFieldOptional({ int: true, min: 1 })
  maxUses?: number;

  @BooleanFieldOptional()
  isActive?: boolean;

  @DateFieldOptional()
  expiresAt?: Date;
}
