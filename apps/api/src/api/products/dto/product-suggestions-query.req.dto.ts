import {
  NumberFieldOptional,
  StringField,
} from '@/decorators/field.decorators';

export class ProductSuggestionsQueryReqDto {
  @StringField({
    description: 'Search query (min 2 chars)',
    minLength: 2,
    maxLength: 200,
  })
  readonly q!: string;

  @NumberFieldOptional({
    description: 'Max results per group (default 8, max 20)',
    minimum: 1,
    maximum: 20,
  })
  readonly limit?: number;
}
