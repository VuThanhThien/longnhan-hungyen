import Link from 'next/link';
import type { Metadata } from 'next';

interface OrderSuccessPageProps {
  searchParams: Promise<{ code?: string | string[] }>;
}

export const metadata: Metadata = {
  title: 'Dat hang thanh cong',
  description:
    'Don hang cua ban da duoc ghi nhan. Chung toi se lien he xac nhan som.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function OrderSuccessPage({
  searchParams,
}: OrderSuccessPageProps) {
  const params = await searchParams;
  const orderCode =
    typeof params.code === 'string'
      ? params.code
      : Array.isArray(params.code)
        ? params.code[0]
        : null;

  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
        <p className="text-5xl mb-4" aria-hidden="true">
          ✅
        </p>
        <h1 className="text-2xl md:text-3xl font-bold text-green-900">
          Dat hang thanh cong
        </h1>
        <p className="mt-3 text-gray-700">
          Cam on ban da dat hang. Doi ngu Long Nhan Tong Tran se lien he xac
          nhan don trong thoi gian som nhat.
        </p>
        {orderCode ? (
          <p className="mt-4 text-sm text-green-800">
            Ma don hang: <span className="font-bold">{orderCode}</span>
          </p>
        ) : null}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white hover:bg-green-600"
          >
            Tiep tuc mua hang
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-green-700 px-5 py-3 text-sm font-semibold text-green-700 hover:bg-green-100"
          >
            Ve trang chu
          </Link>
        </div>
      </div>
    </section>
  );
}
