import { z } from 'zod';

export const paymentMethodSchema = z.union([
  z.literal('cod'),
  z.literal('bank_transfer'),
]);

export const orderCustomerSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập họ tên')
    .min(2, 'Họ tên quá ngắn')
    .max(80, 'Họ tên quá dài'),
  phone: z
    .string()
    .min(1, 'Vui lòng nhập số điện thoại')
    .refine((v) => {
      const compact = v.replace(/\s/g, '');
      if (compact.length < 9 || compact.length > 14) return false;
      return /^(\+?84|0)[0-9]{9,10}$/.test(compact);
    }, 'Số điện thoại không hợp lệ'),
  email: z
    .union([z.string().trim().email('Email không hợp lệ'), z.literal('')])
    .optional(),
  address: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập địa chỉ')
    .max(200, 'Địa chỉ quá dài'),
  province: z.string().trim().min(1, 'Vui lòng chọn tỉnh/thành'),
  paymentMethod: paymentMethodSchema,
  notes: z.string().max(500, 'Ghi chú quá dài').optional(),
});

// Use input type for forms (reflects what user can type).
export type OrderFormValues = z.input<typeof orderCustomerSchema>;

export const orderItemSchema = z.object({
  variantId: z.string().trim().min(1).max(64),
  qty: z.number().int().positive().max(99),
});

export const orderItemsSchema = z.array(orderItemSchema).min(1).max(20);
