import { z } from 'zod';

/** Radix Select rejects empty string values — use this and strip on submit */
export const ADMIN_FILTER_ALL = '__all__' as const;

export const adminArticleListFilterSchema = z.object({
  q: z.string(),
  tag: z.string(),
});

export type AdminArticleListFilterValues = z.infer<
  typeof adminArticleListFilterSchema
>;

export const adminProductListFilterSchema = z.object({
  q: z.string(),
  category: z.string(),
});

export type AdminProductListFilterValues = z.infer<
  typeof adminProductListFilterSchema
>;

export const adminOrderListFilterSchema = z
  .object({
    orderStatus: z.string(),
    paymentStatus: z.string(),
    dateFrom: z.string(),
    dateTo: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.dateFrom && data.dateTo && data.dateFrom > data.dateTo) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.',
        path: ['dateTo'],
      });
    }
  });

export type AdminOrderListFilterValues = z.infer<
  typeof adminOrderListFilterSchema
>;
