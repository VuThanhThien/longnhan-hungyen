import {
  BooleanFieldOptional,
  NumberFieldOptional,
  StringField,
} from '@/decorators/field.decorators';
import { ToLowerCase } from '@/decorators/transform.decorators';

export class CreateCategoryReqDto {
  @StringField({ maxLength: 255 })
  name!: string;

  @StringField({ maxLength: 255 })
  @ToLowerCase()
  slug!: string;

  @NumberFieldOptional({ int: true, min: 0 })
  sortOrder?: number;

  @BooleanFieldOptional()
  active?: boolean;
}
