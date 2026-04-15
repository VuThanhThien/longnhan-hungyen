'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';

import { QuantityStepper } from '@/components/ui/quantity-stepper';
import { formatVnd } from '@/lib/format-vnd';
import type { CartLine } from '@/services/cart/cart-store';
import { useCartStore } from '@/services/cart/cart-store';

type CartLineItemProps = {
  line: CartLine;
};

export function CartLineItem({ line }: CartLineItemProps) {
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeLine = useCartStore((s) => s.removeLine);

  const lineTotalVnd = line.quantity * line.unitPriceVnd;

  return (
    <div className="rounded-2xl border border-(--brand-forest)/10 bg-(--brand-cream) p-4 shadow-sm md:rounded-none md:border-0 md:border-b md:border-(--brand-forest)/10 md:shadow-none md:grid md:grid-cols-[1fr_120px_160px_140px] md:items-center md:gap-4">
      <div className="flex items-start gap-3">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white">
          {line.imageUrl ? (
            <Image
              src={line.imageUrl}
              alt={line.productName}
              width={128}
              height={128}
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className="grid h-full w-full place-items-center text-xl text-(--brand-forest)/30"
              aria-hidden
            >
              🌿
            </div>
          )}
        </div>
        <div className="min-w-0">
          <Link
            href={`/products/${line.productSlug}`}
            className="block font-semibold text-(--brand-forest) hover:text-(--brand-leaf) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--brand-gold) focus-visible:ring-offset-2 focus-visible:ring-offset-(--brand-cream)"
          >
            {line.productName}
          </Link>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-(--brand-forest-muted)">
            <span className="truncate">{line.variantLabel}</span>
            <span aria-hidden className="text-(--brand-forest)/20">
              •
            </span>
            <span className="tabular-nums">{formatVnd(line.unitPriceVnd)}</span>
          </div>
          <button
            type="button"
            className="mt-3 inline-flex items-center gap-2 rounded-xl border border-(--brand-forest)/10 bg-(--brand-cream) px-3 py-2 text-xs font-semibold text-(--brand-forest) shadow-sm transition hover:bg-(--brand-gold)/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--brand-gold) focus-visible:ring-offset-2 focus-visible:ring-offset-(--brand-cream) md:hidden"
            onClick={() => removeLine(line.variantId)}
            aria-label={`Xóa ${line.productName}`}
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            Xóa
          </button>
        </div>
      </div>

      <div className="mt-4 text-sm font-semibold tabular-nums md:mt-0 md:text-right">
        {formatVnd(line.unitPriceVnd)}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 md:mt-0 md:justify-center">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-(--brand-forest-muted) md:hidden">
          Số lượng
        </span>
        <QuantityStepper
          value={line.quantity}
          onChange={(next) => setQuantity(line.variantId, Math.max(1, next))}
          min={1}
          ariaLabel={`Số lượng ${line.productName}`}
        />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 md:mt-0 md:justify-end">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-(--brand-forest-muted) md:hidden">
          Thành tiền
        </span>
        <span className="text-base font-bold tabular-nums text-(--brand-forest)">
          {formatVnd(lineTotalVnd)}
        </span>
        <button
          type="button"
          className="ml-3 hidden h-10 w-10 items-center justify-center rounded-xl border border-(--brand-forest)/10 bg-(--brand-cream) text-(--brand-forest) shadow-sm transition hover:bg-(--brand-gold)/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--brand-gold) focus-visible:ring-offset-2 focus-visible:ring-offset-(--brand-cream) md:inline-flex"
          onClick={() => removeLine(line.variantId)}
          aria-label={`Xóa ${line.productName}`}
        >
          <Trash2 className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
