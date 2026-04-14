import {
  BooleanFieldOptional,
  NumberField,
  NumberFieldOptional,
  StringField,
  StringFieldOptional,
} from '@/decorators/field.decorators';

export class CreateProductVariantReqDto {
  @StringField({ maxLength: 100 })
  label!: string;

  @NumberFieldOptional({ int: true, min: 1 })
  weightG?: number;

  @NumberField({ int: true, min: 0 })
  price!: number;

  @NumberField({ int: true, min: 0 })
  stock!: number;

  @StringFieldOptional({ maxLength: 50, minLength: 0, nullable: true })
  skuCode?: string;

  @NumberFieldOptional({ int: true, min: 0 })
  sortOrder?: number;

  @BooleanFieldOptional()
  active?: boolean;
}
