import * as yup from 'yup';

export const productFormSchema = yup.object({
  name: yup.string().trim().required('Vui lòng nhập tên sản phẩm'),
  category: yup.string().trim().required('Vui lòng nhập danh mục'),
  basePrice: yup
    .number()
    .typeError('Giá gốc không hợp lệ')
    .min(0, 'Giá gốc phải >= 0')
    .required('Vui lòng nhập giá gốc'),
  videoUrl: yup.string().trim().optional(),
  active: yup.boolean().default(true),
  images: yup.string().optional(),
  summary: yup.string().optional(),
  descriptionHtml: yup.string().optional(),
  featuredImageUrl: yup.string().optional(),
  variantsJson: yup.string().optional(),
});

export type ProductFormValues = yup.InferType<typeof productFormSchema>;
