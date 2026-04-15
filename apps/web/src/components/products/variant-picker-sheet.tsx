'use client';

import type { Product, ProductVariant } from '@longnhan/types';
import { ShoppingCart, X } from 'lucide-react';
import { useMemo, useState } from 'react';

import VariantSelector from '@/components/products/variant-selector';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { QuantityStepper } from '@/components/ui/quantity-stepper';
import { formatVnd } from '@/lib/format-vnd';
import { cn } from '@/lib/utils';
import type { CartLine } from '@/services/cart/cart-store';

type VariantPickerSheetProps = {
  product: Product;
  imageUrl: string | null;
  onConfirm: (line: CartLine) => void;
  triggerClassName?: string;
};

function firstAvailableVariantId(variants: ProductVariant[]) {
  return (
    variants.find(
      (v) => (v.active || v.isActive) && (v.stock ?? v.stockQuantity ?? 0) > 0,
    )?.id ?? null
  );
}

export function VariantPickerSheet({
  product,
  imageUrl,
  onConfirm,
  triggerClassName,
}: VariantPickerSheetProps) {
  const [open, setOpen] = useState(false);
  const activeVariants = useMemo(
    () => product.variants.filter((v) => v.active || v.isActive),
    [product.variants],
  );
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    () => firstAvailableVariantId(activeVariants),
  );
  const [quantity, setQuantity] = useState(1);

  const selectedVariant = useMemo(
    () => activeVariants.find((v) => v.id === selectedVariantId) ?? null,
    [activeVariants, selectedVariantId],
  );

  const stock = selectedVariant?.stock ?? selectedVariant?.stockQuantity ?? 0;
  const maxQty = stock > 0 ? stock : undefined;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-border bg-muted/40 px-3 text-xs font-semibold text-foreground shadow-sm transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--brand-gold) focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            triggerClassName,
          )}
          aria-haspopup="dialog"
        >
          Thêm vào giỏ
        </button>
      </DialogTrigger>

      <DialogContent
        showClose={false}
        className={cn(
          'flex max-h-[min(90vh,640px)] w-full max-w-lg flex-col gap-0 overflow-hidden p-0',
          'border-border bg-background sm:rounded-2xl',
        )}
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-border bg-background px-5 pb-4 pt-[max(1.25rem,env(safe-area-inset-top))]">
          <div className="min-w-0 pr-10">
            <DialogTitle className="text-left text-base font-bold leading-snug tracking-tight text-foreground line-clamp-2">
              {product.name}
            </DialogTitle>
            <DialogDescription className="mt-1.5 text-left text-sm text-muted-foreground">
              Chọn loại và số lượng để thêm vào giỏ hàng.
            </DialogDescription>
          </div>
          <DialogClose asChild>
            <button
              type="button"
              className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-foreground shadow-sm transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--brand-gold) focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label="Đóng"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </DialogClose>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <VariantSelector
            variants={activeVariants}
            selectedId={selectedVariantId}
            onSelect={(id) => setSelectedVariantId(id)}
          />
        </div>

        <footer className="shrink-0 space-y-4 border-t border-border bg-background px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="shrink-0 text-sm font-semibold text-foreground">
              Số lượng
            </span>
            <div className="flex min-w-0 flex-1 justify-center">
              <QuantityStepper
                value={quantity}
                onChange={(next) => setQuantity(Math.max(1, next))}
                min={1}
                max={maxQty}
                ariaLabel={`Số lượng ${product.name}`}
              />
            </div>
            <div className="shrink-0 text-sm font-bold tabular-nums text-foreground">
              {formatVnd((selectedVariant?.price ?? 0) * quantity)}
            </div>
          </div>

          <div className="flex w-full flex-row gap-3">
            <DialogClose asChild>
              <button
                type="button"
                className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-border bg-background text-sm font-semibold text-foreground shadow-sm transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--brand-gold) focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Hủy
              </button>
            </DialogClose>
            <button
              type="button"
              disabled={!selectedVariantId}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--brand-gold) focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => {
                if (!selectedVariant) return;
                onConfirm({
                  variantId: selectedVariant.id,
                  quantity,
                  unitPriceVnd: selectedVariant.price,
                  productName: product.name,
                  productSlug: product.slug,
                  variantLabel:
                    selectedVariant.label ?? selectedVariant.name ?? '',
                  imageUrl,
                });
                setOpen(false);
              }}
            >
              <ShoppingCart className="h-4 w-4 shrink-0" aria-hidden />
              Thêm vào giỏ
            </button>
          </div>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
