'use client';

import * as Sentry from '@sentry/nextjs';
import Link from 'next/link';
import { useEffect } from 'react';

const sentryEnabled = process.env.NODE_ENV === 'production';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (!sentryEnabled) return;
    Sentry.captureException(error);
  }, [error]);

  return (
    <section className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-green-950">Đã xảy ra lỗi</h1>
      <p className="mt-3 text-gray-600">
        Trang không tải được. Bạn có thể thử lại hoặc quay về trang chủ.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white hover:bg-green-600"
        >
          Thử lại
        </button>
        <Link
          href="/"
          className="inline-flex items-center rounded-xl border border-border px-5 py-3 text-sm font-semibold text-muted-foreground hover:bg-muted/40 hover:text-foreground"
        >
          Về trang chủ
        </Link>
      </div>
    </section>
  );
}
