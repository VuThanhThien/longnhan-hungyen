import * as yup from 'yup';

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const categoryFormSchema = yup.object({
  name: yup.string().trim().required('Vui lòng nhập tên danh mục'),
  slug: yup
    .string()
    .trim()
    .required('Vui lòng nhập slug')
    .matches(
      slugPattern,
      'Slug chỉ gồm chữ thường, số và dấu gạch (vd: long-nhan-say)',
    ),
  sortOrder: yup
    .number()
    .typeError('Thứ tự phải là số')
    .integer('Thứ tự phải là số nguyên')
    .min(0, 'Thứ tự >= 0')
    .default(0),
  active: yup.boolean().default(true),
});

export type CategoryFormValues = yup.InferType<typeof categoryFormSchema>;
