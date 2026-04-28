import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class ProductSuggestionItemResDto {
  @ApiProperty()
  @Expose()
  name!: string;

  @ApiProperty()
  @Expose()
  slug!: string;

  @ApiPropertyOptional()
  @Expose()
  featuredImageUrl: string | null;

  @ApiProperty()
  @Expose()
  basePrice!: number;
}

export class CategorySuggestionItemResDto {
  @ApiProperty()
  @Expose()
  slug!: string;

  @ApiProperty()
  @Expose()
  name!: string;
}

export class ProductSuggestionsResDto {
  @ApiProperty()
  @Expose()
  q!: string;

  @ApiProperty({ type: [CategorySuggestionItemResDto] })
  @Expose()
  @Type(() => CategorySuggestionItemResDto)
  categories!: CategorySuggestionItemResDto[];

  @ApiProperty({ type: [ProductSuggestionItemResDto] })
  @Expose()
  @Type(() => ProductSuggestionItemResDto)
  products!: ProductSuggestionItemResDto[];
}
