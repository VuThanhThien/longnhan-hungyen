import {
  BooleanFieldOptional,
  NumberFieldOptional,
  StringFieldOptional,
} from '@/decorators/field.decorators';

export class UpdateProductVariantReqDto {
  @StringFieldOptional({ maxLength: 100 })
  label?: string;

  @NumberFieldOptional({ int: true, min: 1 })
  weightG?: number;

  @NumberFieldOptional({ int: true, min: 0 })
  price?: number;

  @NumberFieldOptional({ int: true, min: 0 })
  stock?: number;

  @StringFieldOptional({ maxLength: 50, minLength: 0, nullable: true })
  skuCode?: string;

  @NumberFieldOptional({ int: true, min: 0 })
  sortOrder?: number;

  @BooleanFieldOptional()
  active?: boolean;
}
