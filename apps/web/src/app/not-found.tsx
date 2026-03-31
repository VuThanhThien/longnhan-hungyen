import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 text-center">
      <p className="text-6xl mb-4" aria-hidden="true">
        404
      </p>
      <h1 className="text-2xl md:text-3xl font-bold text-green-950">Khong tim thay noi dung</h1>
      <p className="mt-3 text-gray-600">
        Trang ban tim khong ton tai hoac da duoc di chuyen.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white hover:bg-green-600"
        >
          Ve trang chu
        </Link>
        <Link
          href="/products"
          className="inline-flex items-center rounded-xl border border-green-700 px-5 py-3 text-sm font-semibold text-green-700 hover:bg-green-100"
        >
          Xem san pham
        </Link>
      </div>
    </section>
  );
}
