import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Giỏ hàng',
  description: 'Giỏ hàng — Long Nhãn Tống Trân',
};

export default function CartPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 text-(--brand-forest)">
      <h1 className="text-2xl font-semibold">Giỏ hàng</h1>
      <p className="mt-4 text-(--brand-forest-muted)">
        Chưa có sản phẩm trong giỏ.{' '}
        <Link href="/products" className="font-medium text-(--brand-leaf) underline underline-offset-2 hover:text-(--brand-forest)">
          Xem sản phẩm
        </Link>
      </p>
    </section>
  );
}
