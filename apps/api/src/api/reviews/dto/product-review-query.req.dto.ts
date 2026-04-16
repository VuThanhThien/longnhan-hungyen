import {
  NumberFieldOptional,
  StringFieldOptional,
} from '@/decorators/field.decorators';

export class ProductReviewQueryReqDto {
  @NumberFieldOptional({ int: true, min: 1, max: 50, default: 10 })
  limit?: number;

  @StringFieldOptional({ maxLength: 100 })
  cursor?: string;
}
