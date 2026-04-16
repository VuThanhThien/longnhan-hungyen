'use server';

import { redirect } from 'next/navigation';
import { isRedirectError } from 'next/dist/client/components/redirect-error';

import { apiServer } from '@/lib/api-server';
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

export async function submitOrder(formData: FormData): Promise<void> {
  let itemsJson: unknown;
  try {
    itemsJson = requireJsonString(formData, 'items');
  } catch {
    throw new Error('Dữ liệu sản phẩm không hợp lệ');
  }

  const rawPaymentMethod = requireNonEmptyString(formData, 'paymentMethod');
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

  const body = {
    ...customerParse.data,
    email: customerParse.data.email ? customerParse.data.email : undefined,
    items: itemsParse.data,
  };

  try {
    const { data } = await apiServer.post<{
      code: string;
      total: number;
      paymentMethod: string;
    }>('/orders', body);

    if (!data?.code) {
      throw new Error('Thiếu mã đơn hàng từ hệ thống');
    }

    captureOrderSubmitSuccess(data.code);

    redirect(`/order-success?code=${encodeURIComponent(data.code)}`);
  } catch (err) {
    if (isRedirectError(err)) {
      throw err;
    }

    captureOrderSubmitFailure(err);
    throw new Error('Đặt hàng thất bại, vui lòng thử lại.');
  }
}
