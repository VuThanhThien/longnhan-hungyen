import * as yup from 'yup';

export interface OrderFormValues {
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  province: string;
  paymentMethod: 'cod' | 'bank_transfer';
  notes?: string;
}

export const orderFormSchema: yup.ObjectSchema<OrderFormValues> = yup
  .object({
    customerName: yup
      .string()
      .required('Vui lòng nhập họ tên')
      .trim()
      .min(2, 'Họ tên quá ngắn'),
    phone: yup
      .string()
      .required('Vui lòng nhập số điện thoại')
      .transform((v) => (v ?? '').replace(/\s/g, ''))
      .min(9, 'Số điện thoại quá ngắn')
      .max(14, 'Số điện thoại không hợp lệ')
      .matches(/^(\+?84|0)[0-9]{9,10}$/, 'Số điện thoại không hợp lệ'),
    email: yup
      .string()
      .optional()
      .transform((v) => (v === '' || v === undefined ? undefined : v))
      .email('Email không hợp lệ'),
    address: yup.string().required('Vui lòng nhập địa chỉ').trim(),
    province: yup.string().required('Vui lòng chọn tỉnh/thành'),
    paymentMethod: yup
      .mixed<'cod' | 'bank_transfer'>()
      .oneOf(['cod', 'bank_transfer'], 'Chọn phương thức thanh toán')
      .required(),
    notes: yup.string().optional(),
  })
  .required();
