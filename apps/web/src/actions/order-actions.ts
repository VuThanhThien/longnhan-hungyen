'use server';

import { redirect } from 'next/navigation';
import * as Sentry from '@sentry/nextjs';
import { isRedirectError } from 'next/dist/client/components/redirect-error';

import { apiServer } from '@/lib/api-server';

export async function submitOrder(formData: FormData): Promise<void> {
  const itemsRaw = formData.get('items');

  if (!itemsRaw) {
    throw new Error('Không có sản phẩm trong đơn hàng');
  }

  const body = {
    customerName: formData.get('customerName'),
    phone: formData.get('phone'),
    email: formData.get('email') || undefined,
    address: formData.get('address'),
    province: formData.get('province') || undefined,
    notes: formData.get('notes') || undefined,
    paymentMethod: formData.get('paymentMethod'),
    items: JSON.parse(itemsRaw as string) as {
      variantId: string;
      qty: number;
    }[],
  };

  try {
    const { data } = await apiServer.post<{ code: string }>('/orders', body);

    if (process.env.NODE_ENV === 'production') {
      Sentry.captureMessage('order_submit:success', {
        level: 'info',
        tags: { order_code: data.code },
      });
    }

    redirect(`/order-success?code=${data.code}`);
  } catch (err) {
    if (isRedirectError(err)) {
      throw err;
    }

    if (process.env.NODE_ENV === 'production') {
      const status = (err as { response?: { status?: number } })?.response
        ?.status;
      const code = (err as { code?: string })?.code;
      Sentry.captureException(new Error('order_submit_failed'), {
        tags: {
          order_submit: 'error',
          ...(status ? { http_status: String(status) } : null),
          ...(code ? { error_code: code } : null),
        },
      });
    }
    throw new Error('Đặt hàng thất bại, vui lòng thử lại.');
  }
}
