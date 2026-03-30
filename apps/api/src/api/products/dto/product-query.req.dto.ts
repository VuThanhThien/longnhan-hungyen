import { PageOptionsDto } from '@/common/dto/offset-pagination/page-options.dto';
import { StringFieldOptional } from '@/decorators/field.decorators';

export class ProductQueryReqDto extends PageOptionsDto {
  @StringFieldOptional()
  readonly category?: string;
}
