import { z } from 'zod';
import type { VariantDraft } from './product-form.interface';

const variantDraftSchema: z.ZodType<VariantDraft> = z.object({
  label: z.string().trim().optional().default(''),
  price: z.number().min(0, 'Giá phải >= 0'),
  stock: z.number().int().min(0, 'Tồn kho phải >= 0'),
  weightG: z.number().min(0, 'Khối lượng phải >= 0').optional(),
  skuCode: z.string().trim().optional(),
  sortOrder: z.number().int().min(0),
  active: z.boolean(),
});

export const productFormSchema = z.object({
  name: z.string().trim().min(1, 'Vui lòng nhập tên sản phẩm'),
  categoryId: z
    .string()
    .trim()
    .uuid('Vui lòng chọn danh mục')
    .min(1, 'Vui lòng chọn danh mục'),
  basePrice: z
    .number({ error: 'Giá gốc không hợp lệ' })
    .min(0, 'Giá gốc phải >= 0'),
  videoUrl: z.string().trim().optional(),
  active: z.boolean().default(true),
  images: z.string().optional(),
  summary: z.string().optional(),
  descriptionHtml: z.string().optional(),
  featuredImageUrl: z.string().optional(),
  variants: z.array(variantDraftSchema).optional(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
