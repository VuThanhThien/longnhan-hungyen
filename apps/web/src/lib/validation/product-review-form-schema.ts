import { z } from 'zod';

export const productReviewFormSchema = z
  .object({
    savedOrderCode: z.string(),
    manualOrderCode: z.string(),
    phone: z.string().trim().min(1, 'Vui lòng nhập số điện thoại đặt hàng.'),
    rating: z.number().int().min(1).max(5),
    isAnonymous: z.boolean(),
    displayName: z.string(),
    comment: z.string().max(2000, 'Nhận xét quá dài.'),
  })
  .superRefine((data, ctx) => {
    const orderCode = data.savedOrderCode.trim() || data.manualOrderCode.trim();
    if (!orderCode) {
      const msg = 'Vui lòng chọn đơn đã lưu hoặc nhập mã đơn hàng.';
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: msg,
        path: ['savedOrderCode'],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: msg,
        path: ['manualOrderCode'],
      });
    }
    if (!data.isAnonymous && !data.displayName.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Vui lòng nhập tên hiển thị hoặc chọn ẩn danh.',
        path: ['displayName'],
      });
    }
  });

export type ProductReviewFormValues = z.input<typeof productReviewFormSchema>;
