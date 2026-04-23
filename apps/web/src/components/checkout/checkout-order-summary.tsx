'use client';

import Link from 'next/link';

import { SHIPPING_FLAT_VND } from '@/lib/constants';
import { formatVnd } from '@/lib/format-vnd';
import { useCartStore } from '@/services/cart/cart-store';

function cartSubtotal(lines: { quantity: number; unitPriceVnd: number }[]) {
  return lines.reduce((sum, l) => sum + l.quantity * l.unitPriceVnd, 0);
}

type CheckoutOrderSummaryProps = {
  discountAmount?: number;
  voucherCode?: string | null;
};

export function CheckoutOrderSummary({
  discountAmount = 0,
  voucherCode = null,
}: CheckoutOrderSummaryProps = {}) {
  const lines = useCartStore((s) => s.lines);

  const subtotalVnd = cartSubtotal(lines);
  const shippingVnd = lines.length > 0 ? SHIPPING_FLAT_VND : 0;
  const grandTotalVnd = Math.max(0, subtotalVnd + shippingVnd - discountAmount);

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
        {discountAmount > 0 ? (
          <div className="flex items-center justify-between py-2">
            <span className="text-(--brand-forest-muted)">
              Giảm giá{voucherCode ? ` (${voucherCode})` : ''}
            </span>
            <span className="font-semibold tabular-nums text-(--brand-leaf)">
              -{formatVnd(discountAmount)}
            </span>
          </div>
        ) : null}
        <div className="my-2 h-px bg-(--brand-forest)/10" />
        <div className="flex items-baseline justify-between pt-2">
          <span className="text-sm font-semibold">Tổng cộng</span>
          <span className="text-lg font-bold tabular-nums">
            {formatVnd(grandTotalVnd)}
          </span>
        </div>
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
