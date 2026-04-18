'use server';

import { isRedirectError } from 'next/dist/client/components/redirect-error';

import { apiServer } from '@/lib/api-server';
import { captureApiFetchError } from '@/lib/observability/api-fetch-sentry';
import { requireNonEmptyString } from '@/lib/formdata/formdata-utils';

export type PublicOrderItemSummary = {
  name: string;
  qty: number;
  subtotal: number;
};

export type PublicOrderSummary = {
  code: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  total: number;
  createdAt: string;
  province: string | null;
  addressPreview: string | null;
  items: PublicOrderItemSummary[];
};

export type LookupOrderState =
  | { ok: false; error: string; data?: undefined }
  | { ok: true; error?: undefined; data: PublicOrderSummary };

export async function lookupOrderAction(
  _prevState: LookupOrderState,
  formData: FormData,
): Promise<LookupOrderState> {
  try {
    const code = requireNonEmptyString(formData, 'code').slice(0, 64);

    const { data } = await apiServer.get<PublicOrderSummary>(
      '/orders/summary',
      {
        params: { code },
      },
    );

    return { ok: true, data };
  } catch (err) {
    if (isRedirectError(err)) throw err;
    captureApiFetchError(err, {
      route: '/track-order',
      section: 'order_lookup',
    });
    return {
      ok: false,
      error: 'Không tìm thấy đơn hàng. Vui lòng kiểm tra lại mã.',
    };
  }
}
