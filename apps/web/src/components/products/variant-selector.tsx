'use client';

// Variant selector — radio buttons for product weight/size options
// Calls onSelect with chosen variantId so order form can track selection

import type { ProductVariant } from '@longnhan/types';

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedId: string | null;
  onSelect: (variantId: string) => void;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
}

export default function VariantSelector({
  variants,
  selectedId,
  onSelect,
}: VariantSelectorProps) {
  const activeVariants = variants.filter((v) => v.active || v.isActive);

  if (activeVariants.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Sản phẩm hiện chưa có loại nào.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium text-muted-foreground">Chọn loại:</p>
      <div className="flex flex-wrap gap-2">
        {activeVariants.map((variant) => {
          const isSelected = variant.id === selectedId;
          const stock = variant.stock ?? variant.stockQuantity ?? 0;
          const outOfStock = stock <= 0;
          return (
            <button
              key={variant.id}
              type="button"
              disabled={outOfStock}
              onClick={() => !outOfStock && onSelect(variant.id)}
              className={`rounded-xl border px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                isSelected
                  ? 'border-primary bg-muted/50 text-foreground shadow-sm ring-1 ring-primary/20'
                  : outOfStock
                    ? 'cursor-not-allowed border-border bg-muted/30 text-muted-foreground'
                    : 'border-border bg-background text-foreground hover:border-primary/50 hover:bg-muted/40'
              }`}
            >
              <span>{variant.label ?? variant.name}</span>
              <span className="ml-2 font-semibold text-primary">
                {formatPrice(variant.price)}
              </span>
              {outOfStock && (
                <span className="ml-1 text-xs text-red-600">(Hết hàng)</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
