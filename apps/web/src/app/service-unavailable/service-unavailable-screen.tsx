'use client';

import Link from 'next/link';

export function ServiceUnavailableScreen() {
  return (
    <section className="mx-auto max-w-lg px-4 py-20 text-center">
      <p
        className="font-[family-name:var(--font-display)] text-6xl font-bold text-(--brand-forest) md:text-7xl"
        aria-hidden
      >
        503
      </p>
      <span className="sr-only">Lỗi 503 — dịch vụ tạm ngưng</span>
      <h1 className="mt-4 text-2xl font-bold text-(--brand-forest) md:text-3xl">
        Hệ thống tạm không phản hồi
      </h1>
      <p className="mt-3 text-pretty text-(--brand-forest-soft)">
        Máy chủ đang bảo trì hoặc quá tải. Bạn có thể thử tải lại trang sau vài
        phút.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex items-center rounded-xl bg-(--brand-leaf) px-5 py-3 text-sm font-semibold text-(--brand-cream) transition hover:opacity-90"
        >
          Thử lại
        </button>
        <Link
          href="/"
          className="inline-flex items-center rounded-xl border-2 border-(--brand-forest)/20 px-5 py-3 text-sm font-semibold text-(--brand-forest) transition hover:border-(--brand-gold)/55 hover:bg-(--brand-gold)/10"
        >
          Về trang chủ
        </Link>
      </div>
    </section>
  );
}
