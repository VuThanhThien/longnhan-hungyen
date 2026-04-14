import type { Product } from '@longnhan/types';

export interface ProductFormProps {
  initialProduct?: Product;
  submitLabel: string;
  onSubmit: (formData: FormData) => void | Promise<void>;
  isSubmitting?: boolean;
  showVariants?: boolean;
}

export interface VariantDraft {
  label: string;
  price: number;
  stock: number;
  weightG?: number;
  skuCode?: string;
  sortOrder: number;
  active: boolean;
}
