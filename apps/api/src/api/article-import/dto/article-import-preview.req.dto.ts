import { StringField } from '@/decorators/field.decorators';
import { IsUrl } from 'class-validator';

export class ArticleImportPreviewReqDto {
  @StringField({ maxLength: 2048 })
  @IsUrl({ require_protocol: true })
  url!: string;
}
