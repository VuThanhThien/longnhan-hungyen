export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  imageUrls: string[];
  videoUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  variants: ProductVariant[];
}

export interface ProductVariant {
  id: number;
  productId: number;
  name: string;
  sku: string;
  price: number;
  stockQuantity: number;
  weightGrams: number | null;
  isActive: boolean;
}

export interface CreateProductDto {
  name: string;
  slug: string;
  description?: string;
  imageUrls?: string[];
  videoUrl?: string;
  isActive?: boolean;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}

export interface CreateProductVariantDto {
  productId: number;
  name: string;
  sku: string;
  price: number;
  stockQuantity: number;
  weightGrams?: number;
  isActive?: boolean;
}

export interface UpdateProductVariantDto extends Partial<CreateProductVariantDto> {}
