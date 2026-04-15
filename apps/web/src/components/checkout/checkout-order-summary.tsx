'use client';

import Link from 'next/link';

import { SHIPPING_FLAT_VND } from '@/lib/constants';
import { formatVnd } from '@/lib/format-vnd';
import { useCartStore } from '@/services/cart/cart-store';

function cartSubtotal(lines: { quantity: number; unitPriceVnd: number }[]) {
  return lines.reduce((sum, l) => sum + l.quantity * l.unitPriceVnd, 0);
}

export function CheckoutOrderSummary() {
  const lines = useCartStore((s) => s.lines);

  const subtotalVnd = cartSubtotal(lines);
  const shippingVnd = lines.length > 0 ? SHIPPING_FLAT_VND : 0;
  const grandTotalVnd = subtotalVnd + shippingVnd;

  return (
    <aside className="rounded-2xl border border-(--brand-gold)/25 bg-(--brand-cream) p-4 shadow-sm lg:sticky lg:top-24">
      <h2 className="text-base font-bold">Đơn hàng</h2>

      <div className="mt-3 space-y-3">
        {lines.map((line) => (
          <div
            key={line.variantId}
            className="flex items-start justify-between"
          >
            <div className="min-w-0 pr-3">
              <Link
                href={`/products/${line.productSlug}`}
                className="block truncate text-sm font-semibold text-(--brand-forest) hover:text-(--brand-leaf) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--brand-gold) focus-visible:ring-offset-2 focus-visible:ring-offset-(--brand-cream)"
              >
                {line.productName}
              </Link>
              <div className="mt-1 text-xs text-(--brand-forest-muted)">
                {line.variantLabel} · x{line.quantity}
              </div>
            </div>
            <div className="shrink-0 text-sm font-semibold tabular-nums">
              {formatVnd(line.quantity * line.unitPriceVnd)}
            </div>
          </div>
        ))}
      </div>

      <div className="my-4 h-px bg-(--brand-forest)/10" />

      <div className="text-sm">
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

      <div className="mt-4">
        <Link
          href="/cart"
          className="text-sm font-semibold text-(--brand-leaf) underline underline-offset-2 hover:text-(--brand-forest)"
        >
          Quay lại giỏ hàng
        </Link>
      </div>
    </aside>
  );
}
