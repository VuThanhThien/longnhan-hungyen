import { StringField } from '@/decorators/field.decorators';

export class CreateMediaFolderReqDto {
  @StringField()
  name!: string;
}
