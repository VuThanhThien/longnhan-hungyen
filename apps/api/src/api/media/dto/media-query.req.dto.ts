import { PageOptionsDto } from '@/common/dto/offset-pagination/page-options.dto';
import { StringFieldOptional } from '@/decorators/field.decorators';

export class MediaQueryReqDto extends PageOptionsDto {
  @StringFieldOptional()
  folder?: string;
}
