'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCartTotals } from '@/services/cart/cart-store';
import { formatVnd } from '@/lib/format-vnd';

export default function HeaderCartButton() {
  const { itemCount, totalVnd } = useCartTotals();

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="flex min-w-0 flex-col items-end leading-tight">
        <span className="text-xs font-bold tabular-nums text-(--brand-forest) sm:text-sm">
          {formatVnd(totalVnd)}
        </span>
        <span className="text-[10px] text-(--brand-forest-muted) sm:text-xs">
          {itemCount} sản phẩm
        </span>
      </div>
      <Link
        href="/cart"
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-(--brand-gold)/60 bg-(--brand-cream) text-(--brand-forest) shadow-sm transition hover:border-(--brand-gold) hover:bg-(--brand-gold)/15 hover:shadow-md"
        aria-label={`Giỏ hàng, ${itemCount} sản phẩm, ${formatVnd(totalVnd)}`}
      >
        <ShoppingCart className="h-5 w-5 text-(--brand-leaf)" aria-hidden />
      </Link>
    </div>
  );
}
