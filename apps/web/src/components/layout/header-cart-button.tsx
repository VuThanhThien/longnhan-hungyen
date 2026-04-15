'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ShoppingCart, X } from 'lucide-react';

import {
  Popover,
  PopoverAnchor,
  PopoverArrow,
  PopoverContent,
} from '@/components/ui/popover';
import { formatVnd } from '@/lib/format-vnd';
import { useCartStore, useCartTotals } from '@/services/cart/cart-store';

const HOVER_CLOSE_MS = 140;

/** Radix Popover + hover: bridge pointer moves between anchor and portaled content. */
export default function HeaderCartButton() {
  const [open, setOpen] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { itemCount, totalVnd } = useCartTotals();
  const lines = useCartStore((s) => s.lines);
  const removeLine = useCartStore((s) => s.removeLine);

  const cancelScheduledClose = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    cancelScheduledClose();
    closeTimerRef.current = setTimeout(() => {
      setOpen(false);
      closeTimerRef.current = null;
    }, HOVER_CLOSE_MS);
  }, [cancelScheduledClose]);

  const handleOpenPointer = useCallback(() => {
    cancelScheduledClose();
    setOpen(true);
  }, [cancelScheduledClose]);

  useEffect(() => {
    return () => cancelScheduledClose();
  }, [cancelScheduledClose]);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverAnchor asChild>
        <div
          className="flex items-center gap-2 sm:gap-3"
          onPointerEnter={handleOpenPointer}
          onPointerLeave={scheduleClose}
        >
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
            className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-(--brand-gold)/60 bg-(--brand-cream) text-(--brand-forest) shadow-sm transition hover:border-(--brand-gold) hover:bg-(--brand-gold)/15 hover:shadow-md"
            aria-label={`Giỏ hàng, ${itemCount} sản phẩm, ${formatVnd(totalVnd)}`}
            title="Giỏ hàng"
          >
            <ShoppingCart className="h-5 w-5 text-(--brand-leaf)" aria-hidden />
            {itemCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-(--brand-gold-dark) px-1 text-[10px] font-bold leading-none text-white">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            ) : null}
          </Link>
        </div>
      </PopoverAnchor>

      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={10}
        collisionPadding={16}
        className="w-[min(100vw-1.5rem,22rem)]"
        onPointerEnter={handleOpenPointer}
        onPointerLeave={scheduleClose}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <PopoverArrow className="fill-white" width={14} height={7} />

        {lines.length === 0 ? (
          <div className="px-4 pb-4 pt-2 text-center text-sm text-(--brand-forest-muted)">
            <p className="font-medium text-(--brand-forest)">Giỏ hàng trống</p>
            <p className="mt-1 text-xs">Thêm sản phẩm để xem tại đây.</p>
            <Link
              href="/products"
              className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-[#D49B42] px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-[#c48a38]"
            >
              Xem sản phẩm
            </Link>
          </div>
        ) : (
          <>
            <ul className="max-h-[min(50vh,16rem)] divide-y divide-(--brand-forest)/10 overflow-y-auto px-3 pt-2">
              {lines.map((line) => (
                <li key={line.variantId} className="flex gap-2 py-3 first:pt-1">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-(--brand-cream)">
                    {line.imageUrl ? (
                      <Image
                        src={line.imageUrl}
                        alt={line.productName}
                        width={56}
                        height={56}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div
                        className="grid h-full w-full place-items-center text-lg text-(--brand-forest)/25"
                        aria-hidden
                      >
                        🌿
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/products/${line.productSlug}`}
                      className="line-clamp-2 text-sm font-semibold leading-snug text-(--brand-forest) hover:text-(--brand-leaf)"
                      onClick={() => setOpen(false)}
                    >
                      {line.productName}
                    </Link>
                    <p className="mt-0.5 text-xs font-semibold tabular-nums text-[#C1272D]">
                      {line.quantity} × {formatVnd(line.unitPriceVnd)}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="flex h-8 w-8 shrink-0 items-center justify-center self-start rounded-full border border-(--brand-forest)/10 bg-(--brand-cream) text-(--brand-forest-muted) transition hover:bg-(--brand-gold)/15 hover:text-(--brand-forest)"
                    aria-label={`Xóa ${line.productName}`}
                    onClick={() => removeLine(line.variantId)}
                  >
                    <X className="h-4 w-4" strokeWidth={2} aria-hidden />
                  </button>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between border-t border-(--brand-forest)/10 px-4 py-3 text-sm">
              <span className="text-(--brand-forest-muted)">Tổng số phụ:</span>
              <span className="font-bold tabular-nums text-[#C1272D]">
                {formatVnd(totalVnd)}
              </span>
            </div>

            <div className="flex flex-col gap-2 border-t border-(--brand-forest)/10 px-3 pb-3 pt-2">
              <Link
                href="/cart"
                className="flex w-full items-center justify-center rounded-md bg-[#D49B42] px-4 py-2.5 text-center text-xs font-bold uppercase tracking-wide text-white transition hover:bg-[#c48a38]"
                onClick={() => setOpen(false)}
              >
                Xem giỏ hàng
              </Link>
              <Link
                href="/checkout"
                className="flex w-full items-center justify-center rounded-md bg-[#C87453] px-4 py-2.5 text-center text-xs font-bold uppercase tracking-wide text-white transition hover:bg-[#b56443]"
                onClick={() => setOpen(false)}
              >
                Thanh toán
              </Link>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
