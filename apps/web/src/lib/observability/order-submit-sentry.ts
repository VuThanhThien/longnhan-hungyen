import * as Sentry from '@sentry/nextjs';
import { createHash } from 'node:crypto';

export function captureOrderSubmitSuccess(orderCode: string) {
  if (process.env.NODE_ENV !== 'production') return;
  const orderCodeHash = createHash('sha256')
    .update(String(orderCode))
    .digest('hex')
    .slice(0, 16);
  Sentry.captureMessage('order_submit:success', {
    level: 'info',
    tags: { order_code_hash: orderCodeHash },
  });
}

export function captureOrderSubmitFailure(err: unknown) {
  if (process.env.NODE_ENV !== 'production') return;

  const status = (err as { response?: { status?: number } })?.response?.status;
  const code = (err as { code?: string })?.code;

  if (status && status >= 400 && status < 500) {
    Sentry.captureMessage('order_submit:failed', {
      level: 'warning',
      tags: {
        ...(status ? { http_status: String(status) } : null),
        ...(code ? { error_code: code } : null),
      },
    });
    return;
  }

  const errMessage =
    err instanceof Error ? err.message : 'unknown_order_submit_error';
  Sentry.captureException(new Error(`order_submit:error:${errMessage}`), {
    tags: {
      ...(status ? { http_status: String(status) } : null),
      ...(code ? { error_code: code } : null),
    },
  });
}
