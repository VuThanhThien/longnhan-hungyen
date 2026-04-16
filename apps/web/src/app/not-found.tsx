import Link from 'next/link';

import FuzzyText from '@/components/ui/fuzzy-text';

export default function NotFound() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 text-center">
      <div className="mb-4 flex justify-center" aria-hidden="true">
        <FuzzyText
          fontSize="clamp(4rem, 14vw, 9rem)"
          fontWeight={900}
          color="#052e16"
          baseIntensity={0.12}
          hoverIntensity={0.45}
          fuzzRange={26}
          fps={60}
          className="max-w-full"
        >
          404
        </FuzzyText>
      </div>
      <span className="sr-only">404</span>
      <h1 className="text-2xl md:text-3xl font-bold text-green-950">
        Không tìm thấy nội dung
      </h1>
      <p className="mt-3 text-gray-600">
        Trang bạn tìm kiếm hiện không tìm thấy hoặc đã di chuyển
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white hover:bg-green-600"
        >
          Về trang chủ
        </Link>
        <Link
          href="/products"
          className="inline-flex items-center rounded-xl border border-border px-5 py-3 text-sm font-semibold text-muted-foreground hover:bg-muted/40 hover:text-foreground"
        >
          Xem sản phẩm
        </Link>
      </div>
    </section>
  );
}
