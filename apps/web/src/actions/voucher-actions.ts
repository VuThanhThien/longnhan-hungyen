'use server';

import { apiServer } from '@/lib/api-server';
import { captureApiFetchError } from '@/lib/observability/api-fetch-sentry';

export type ValidateVoucherResult = {
  valid: boolean;
  discountAmount: number;
  finalTotal: number;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  message?: string;
};

export async function validateVoucher(
  code: string,
  orderTotal: number,
  phone: string,
): Promise<ValidateVoucherResult> {
  const trimmedCode = code.trim();
  const trimmedPhone = phone.trim();

  if (!trimmedCode) {
    return {
      valid: false,
      discountAmount: 0,
      finalTotal: orderTotal,
      message: 'Vui lòng nhập mã giảm giá',
    };
  }
  if (!trimmedPhone) {
    return {
      valid: false,
      discountAmount: 0,
      finalTotal: orderTotal,
      message: 'Vui lòng nhập số điện thoại trước',
    };
  }

  try {
    const { data } = await apiServer.post<ValidateVoucherResult>(
      '/vouchers/validate',
      {
        code: trimmedCode,
        orderTotal,
        phone: trimmedPhone,
      },
    );
    return data;
  } catch (err) {
    captureApiFetchError(err, {
      route: '/checkout',
      section: 'voucher_validate',
    });
    return {
      valid: false,
      discountAmount: 0,
      finalTotal: orderTotal,
      message: 'Không thể kiểm tra mã giảm giá. Vui lòng thử lại.',
    };
  }
}
