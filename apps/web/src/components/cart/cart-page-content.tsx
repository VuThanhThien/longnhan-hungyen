'use client';

import Link from 'next/link';

import { CartLineItem } from '@/components/cart/cart-line-item';
import { SHIPPING_FLAT_VND } from '@/lib/constants';
import { formatVnd } from '@/lib/format-vnd';
import { useCartStore } from '@/services/cart/cart-store';

function cartSubtotal(lines: { quantity: number; unitPriceVnd: number }[]) {
  return lines.reduce((sum, l) => sum + l.quantity * l.unitPriceVnd, 0);
}

export function CartPageContent() {
  const lines = useCartStore((s) => s.lines);

  const subtotalVnd = cartSubtotal(lines);
  const shippingVnd = lines.length > 0 ? SHIPPING_FLAT_VND : 0;
  const grandTotalVnd = subtotalVnd + shippingVnd;
  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 text-(--brand-forest) md:py-12">
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <h1 className="text-2xl font-semibold md:text-3xl">Giỏ hàng</h1>
        <div className="text-sm text-(--brand-forest-muted) tabular-nums">
          <span aria-live="polite">{itemCount}</span> sản phẩm
        </div>
      </div>

      {lines.length === 0 ? (
        <p className="mt-4 text-(--brand-forest-muted)">
          Chưa có sản phẩm trong giỏ.{' '}
          <Link
            href="/products"
            className="font-medium text-(--brand-leaf) underline underline-offset-2 hover:text-(--brand-forest)"
          >
            Xem sản phẩm
          </Link>
        </p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="md:rounded-2xl md:border md:border-(--brand-gold)/25 md:bg-(--brand-cream) md:shadow-sm">
            <div className="hidden md:grid md:grid-cols-[1fr_120px_160px_140px] md:gap-4 md:px-4 md:py-3 text-xs font-semibold uppercase tracking-[0.18em] text-(--brand-forest-muted)">
              <div>Sản phẩm</div>
              <div className="text-right">Giá</div>
              <div className="text-center">Số lượng</div>
              <div className="text-right">Thành tiền</div>
            </div>
            <div className="space-y-3 md:space-y-0">
              {lines.map((line) => (
                <CartLineItem key={line.variantId} line={line} />
              ))}
            </div>
          </div>

          <aside className="rounded-2xl border border-(--brand-gold)/25 bg-(--brand-cream) p-4 shadow-sm lg:sticky lg:top-24">
            <h2 className="text-base font-bold">Tóm tắt đơn hàng</h2>

            <div className="mt-3 text-sm">
              <div className="flex items-center justify-between py-2">
                <span className="text-(--brand-forest-muted)">Tạm tính</span>
                <span className="font-semibold tabular-nums">
                  {formatVnd(subtotalVnd)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-(--brand-forest-muted)">
                  Vận chuyển (cố định)
                </span>
                <span className="font-semibold tabular-nums">
                  {formatVnd(shippingVnd)}
                </span>
              </div>
              <div className="my-2 h-px bg-(--brand-forest)/10" />
              <div className="flex items-baseline justify-between pt-2">
                <span className="text-sm font-semibold">Tổng cộng</span>
                <span className="text-lg font-bold tabular-nums">
                  {formatVnd(grandTotalVnd)}
                </span>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-(--brand-forest)/10 bg-(--brand-gold)/10 p-3">
              <input
                disabled
                aria-disabled="true"
                placeholder="Mã giảm giá (sắp ra mắt)"
                className="h-11 w-full rounded-xl border border-(--brand-forest)/15 bg-(--brand-cream) px-3 text-sm text-(--brand-forest) opacity-60 cursor-not-allowed"
              />
              <button
                type="button"
                disabled
                className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-xl border-2 border-(--brand-gold)/40 bg-(--brand-gold)/10 text-sm font-semibold text-(--brand-forest) opacity-60 cursor-not-allowed"
              >
                Áp dụng
              </button>
            </div>

            <div className="mt-4 grid gap-3">
              <Link
                href="/checkout"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-(--brand-forest) px-6 text-sm font-semibold tracking-wide text-(--brand-cream) shadow-md transition hover:bg-(--brand-forest)/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--brand-gold) focus-visible:ring-offset-2 focus-visible:ring-offset-(--brand-cream)"
              >
                Thanh toán
              </Link>
              <Link
                href="/products"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border-2 border-(--brand-gold)/60 bg-(--brand-gold)/10 px-6 text-sm font-semibold text-(--brand-forest) transition hover:bg-(--brand-gold)/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--brand-gold) focus-visible:ring-offset-2 focus-visible:ring-offset-(--brand-cream)"
              >
                Tiếp tục mua hàng
              </Link>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}
