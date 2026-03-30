import { PageOptionsDto } from '@/common/dto/offset-pagination/page-options.dto';
import { StringFieldOptional } from '@/decorators/field.decorators';

export class ArticleQueryReqDto extends PageOptionsDto {
  @StringFieldOptional()
  readonly tag?: string;
}
