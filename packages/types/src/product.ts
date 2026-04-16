export interface ProductCategoryBrief {
  id: string;
  slug: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  summary: string | null;
  descriptionHtml: string | null;
  images: string[];
  featuredImageUrl: string | null;
  basePrice: number;
  videoUrl: string | null;
  /** Category slug for filters and URLs; equals `categoryBrief.slug` when the relation is loaded. */
  category: string;
  categoryBrief?: ProductCategoryBrief;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  variants: ProductVariant[];
  // Backward-compatible aliases for old consumers.
  description?: string | null;
  imageUrls?: string[];
  isActive?: boolean;
}

export interface ProductVariant {
  id: string;
  label: string;
  weightG: number | null;
  price: number;
  stock: number;
  skuCode: string | null;
  sortOrder: number;
  active: boolean;
  // Backward-compatible aliases for old consumers.
  productId?: string;
  name?: string;
  sku?: string;
  stockQuantity?: number;
  weightGrams?: number | null;
  isActive?: boolean;
}

export interface CreateProductDto {
  name: string;
  slug: string;
  summary?: string;
  descriptionHtml?: string;
  images?: string[];
  featuredImageUrl?: string;
  basePrice?: number;
  categoryId?: string;
  category?: string;
  videoUrl?: string;
  active?: boolean;
  // Backward-compatible alias for old consumers.
  description?: string;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}

export interface CreateProductVariantDto {
  productId: string;
  label: string;
  weightG?: number;
  price: number;
  stock: number;
  skuCode?: string;
  sortOrder?: number;
  active?: boolean;
}

export interface UpdateProductVariantDto extends Partial<CreateProductVariantDto> {}
