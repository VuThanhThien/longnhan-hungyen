'use server';

import { apiServer } from '@/lib/api-server';
import { CartLine } from '@/services/cart/cart-store';
import {
  orderCustomerSchema,
  orderItemsSchema,
} from '@/lib/validation/order/order-schemas';
import {
  optionalString,
  requireJsonString,
  requireNonEmptyString,
} from '@/lib/formdata/formdata-utils';
import {
  captureOrderSubmitFailure,
  captureOrderSubmitSuccess,
} from '@/lib/observability/order-submit-sentry';

export type SubmitOrderResult =
  | { kind: 'success'; code: string }
  | {
      kind: 'sepay';
      code: string;
      sepay: { url: string; fields: Record<string, string> };
    };

export async function submitOrder(
  formData: FormData,
): Promise<SubmitOrderResult> {
  let itemsJson: unknown;
  try {
    itemsJson = requireJsonString(formData, 'items');
  } catch {
    throw new Error('Dữ liệu sản phẩm không hợp lệ');
  }

  const rawPaymentMethod = requireNonEmptyString(formData, 'paymentMethod');
  if (rawPaymentMethod === 'cod') {
    const turnstileToken = formData.get('cf-turnstile-response');
    if (!turnstileToken || typeof turnstileToken !== 'string') {
      throw new Error('Thiếu mã xác minh bảo mật.');
    }

    const secretKey = process.env.TURNSTILE_SECRET_KEY;
    if (!secretKey) {
      console.error('[Turnstile] TURNSTILE_SECRET_KEY not configured');
      throw new Error('Lỗi cấu hình hệ thống. Vui lòng liên hệ hỗ trợ.');
    }

    const verifyRes = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          secret: secretKey,
          response: turnstileToken,
        }),
      },
    );

    const verifyData: unknown = await verifyRes.json();
    if (
      !verifyData ||
      typeof verifyData !== 'object' ||
      !('success' in verifyData) ||
      (verifyData as { success?: boolean }).success !== true
    ) {
      throw new Error('Xác minh thất bại. Vui lòng tải lại trang và thử lại.');
    }
  }
  const customerParse = orderCustomerSchema.safeParse({
    customerName: requireNonEmptyString(formData, 'customerName'),
    phone: requireNonEmptyString(formData, 'phone'),
    email: optionalString(formData, 'email') ?? '',
    address: requireNonEmptyString(formData, 'address'),
    province: requireNonEmptyString(formData, 'province'),
    paymentMethod: rawPaymentMethod,
    notes: optionalString(formData, 'notes'),
  });
  if (!customerParse.success) {
    throw new Error(
      customerParse.error.issues[0]?.message ?? 'Dữ liệu đơn hàng không hợp lệ',
    );
  }

  const itemsParse = orderItemsSchema.safeParse(itemsJson);
  if (!itemsParse.success) {
    throw new Error('Dữ liệu sản phẩm không hợp lệ');
  }

  const body: Record<string, unknown> = {
    ...customerParse.data,
    email: customerParse.data.email ? customerParse.data.email : undefined,
    items: itemsParse.data,
  };

  const voucherCode = optionalString(formData, 'voucherCode');
  if (voucherCode) {
    body.voucherCode = voucherCode.trim().toUpperCase();
  }

  try {
    const { data } = await apiServer.post<{
      code: string;
      total: number;
      paymentMethod: string;
      sepay?: { url: string; fields: Record<string, string> };
    }>('/orders', body);

    if (!data?.code) {
      throw new Error('Thiếu mã đơn hàng từ hệ thống');
    }

    captureOrderSubmitSuccess(data.code);

    if (data.sepay) {
      return { kind: 'sepay', code: data.code, sepay: data.sepay };
    }

    return { kind: 'success', code: data.code };
  } catch (err) {
    captureOrderSubmitFailure(err);
    throw new Error('Đặt hàng thất bại, vui lòng thử lại.');
  }
}

export type ValidateCartResult = {
  valid: boolean;
  invalidItems: { variantId: string; reason: string }[];
};

export async function validateCart(
  items: CartLine[],
): Promise<ValidateCartResult> {
  try {
    const { data } = await apiServer.post<ValidateCartResult>(
      '/orders/validate-cart',
      {
        items: items.map((item) => ({
          variantId: item.variantId,
          qty: item.quantity,
        })),
      },
    );
    return data!;
  } catch {
    return { valid: true, invalidItems: [] };
  }
}
