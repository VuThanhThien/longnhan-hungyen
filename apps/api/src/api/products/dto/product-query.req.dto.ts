import { PageOptionsDto } from '@/common/dto/offset-pagination/page-options.dto';
import {
  BooleanFieldOptional,
  StringFieldOptional,
  UUIDFieldOptional,
} from '@/decorators/field.decorators';

export class ProductQueryReqDto extends PageOptionsDto {
  @StringFieldOptional({ description: 'Filter by category slug' })
  readonly category?: string;

  @UUIDFieldOptional({ description: 'Filter by category id' })
  readonly categoryId?: string;

  @BooleanFieldOptional()
  readonly includeInactive?: boolean;
}
