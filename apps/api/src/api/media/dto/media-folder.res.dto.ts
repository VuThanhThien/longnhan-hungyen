import { NumberField, StringField } from '@/decorators/field.decorators';

export class MediaFolderResDto {
  @StringField()
  name!: string;

  @NumberField()
  itemCount!: number;
}
