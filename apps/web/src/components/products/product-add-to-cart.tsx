'use client';

import Link from 'next/link';
import type { ProductVariant } from '@longnhan/types';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import VariantSelector from '@/components/products/variant-selector';
import { QuantityStepper } from '@/components/ui/quantity-stepper';
import { formatVnd } from '@/lib/format-vnd';
import { useCartStore } from '@/services/cart/cart-store';

type ProductAddToCartProps = {
  variants: ProductVariant[];
  productName: string;
  productSlug: string;
  imageUrl: string | null;
};

function firstAvailableVariantId(variants: ProductVariant[]) {
  return (
    variants.find(
      (v) => (v.active || v.isActive) && (v.stock ?? v.stockQuantity ?? 0) > 0,
    )?.id ?? null
  );
}

export function ProductAddToCart({
  variants,
  productName,
  productSlug,
  imageUrl,
}: ProductAddToCartProps) {
  const upsertLine = useCartStore((s) => s.upsertLine);

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    () => firstAvailableVariantId(variants),
  );
  const [quantity, setQuantity] = useState(1);

  const selectedVariant = useMemo(
    () => variants.find((v) => v.id === selectedVariantId) ?? null,
    [variants, selectedVariantId],
  );

  const stock = selectedVariant?.stock ?? selectedVariant?.stockQuantity ?? 0;
  const maxQty = stock > 0 ? stock : undefined;

  const priceVnd = selectedVariant?.price ?? 0;
  const totalVnd = priceVnd * quantity;
  const [statusMessage, setStatusMessage] = useState('');

  return (
    <section className="rounded-2xl border border-(--brand-forest)/10 bg-(--brand-cream) p-4 shadow-sm md:p-6">
      <h2 className="text-lg font-bold text-(--brand-forest)">Thêm vào giỏ</h2>

      <div className="mt-4">
        <VariantSelector
          variants={variants}
          selectedId={selectedVariantId}
          onSelect={(id) => setSelectedVariantId(id)}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-(--brand-forest-muted)">
            Số lượng
          </span>
          <QuantityStepper
            value={quantity}
            onChange={(next) => setQuantity(Math.max(1, next))}
            min={1}
            max={maxQty}
            ariaLabel={`Số lượng ${productName}`}
          />
        </div>
        <div className="text-sm font-bold tabular-nums text-(--brand-forest)">
          {formatVnd(totalVnd)}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          disabled={!selectedVariantId}
          className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-(--brand-forest) px-6 text-sm font-semibold tracking-wide text-(--brand-cream) shadow-md transition hover:bg-(--brand-forest)/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--brand-gold) focus-visible:ring-offset-2 focus-visible:ring-offset-(--brand-cream) disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => {
            if (!selectedVariant) return;
            upsertLine({
              variantId: selectedVariant.id,
              quantity,
              unitPriceVnd: selectedVariant.price,
              productName,
              productSlug,
              variantLabel: selectedVariant.label ?? selectedVariant.name ?? '',
              imageUrl,
            });
            toast.success(`Đã thêm ${productName} vào giỏ hàng.`, {
              duration: 3500,
            });
            setStatusMessage(`Đã thêm ${productName} vào giỏ hàng.`);
          }}
        >
          Thêm vào giỏ
        </button>

        <Link
          href="/checkout"
          className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border-2 border-(--brand-gold)/60 bg-(--brand-gold)/10 px-6 text-sm font-semibold text-(--brand-forest) transition hover:bg-(--brand-gold)/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--brand-gold) focus-visible:ring-offset-2 focus-visible:ring-offset-(--brand-cream)"
          onClick={(e) => {
            if (!selectedVariant) {
              e.preventDefault();
              return;
            }
            upsertLine({
              variantId: selectedVariant.id,
              quantity,
              unitPriceVnd: selectedVariant.price,
              productName,
              productSlug,
              variantLabel: selectedVariant.label ?? selectedVariant.name ?? '',
              imageUrl,
            });
            setStatusMessage(`Đã thêm ${productName} vào giỏ hàng.`);
          }}
        >
          Thanh toán ngay
        </Link>
      </div>

      <div className="sr-only" aria-live="polite">
        {statusMessage}
      </div>

      {stock > 0 ? (
        <p className="mt-3 text-xs text-(--brand-forest-muted)">
          Tồn kho: <span className="font-semibold tabular-nums">{stock}</span>
        </p>
      ) : null}
    </section>
  );
}
