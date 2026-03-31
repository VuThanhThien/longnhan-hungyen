export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  images: string[];
  featuredImageUrl: string | null;
  basePrice: number;
  videoUrl: string | null;
  category: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  variants: ProductVariant[];
  // Backward-compatible aliases for old consumers.
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
  description?: string;
  images?: string[];
  featuredImageUrl?: string;
  basePrice?: number;
  category?: string;
  videoUrl?: string;
  active?: boolean;
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
