import { NumberField, StringField } from '@/decorators/field.decorators';

export class ValidateVoucherReqDto {
  @StringField({ maxLength: 50 })
  code!: string;

  @NumberField({ int: true, min: 0 })
  orderTotal!: number;

  @StringField({ maxLength: 20 })
  phone!: string;
}
