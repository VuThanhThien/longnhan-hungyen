import {
  BooleanFieldOptional,
  NumberFieldOptional,
  StringFieldOptional,
} from '@/decorators/field.decorators';
import { ToLowerCase } from '@/decorators/transform.decorators';

export class UpdateCategoryReqDto {
  @StringFieldOptional({ maxLength: 255 })
  name?: string;

  @StringFieldOptional({ maxLength: 255 })
  @ToLowerCase()
  slug?: string;

  @NumberFieldOptional({ int: true, min: 0 })
  sortOrder?: number;

  @BooleanFieldOptional()
  active?: boolean;
}
