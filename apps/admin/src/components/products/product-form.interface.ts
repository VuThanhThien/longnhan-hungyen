import type { Product } from '@longnhan/types';

export interface ProductFormProps {
  initialProduct?: Product;
  submitLabel: string;
  onSubmit: (formData: FormData) => void | Promise<void>;
  isSubmitting?: boolean;
  showVariants?: boolean;
  /** When set, the form element receives this id (e.g. for an external submit control via the `form` attribute). */
  formId?: string;
  /** Hide the inline submit button (e.g. when using a sticky toolbar submit). */
  hideSubmitButton?: boolean;
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
