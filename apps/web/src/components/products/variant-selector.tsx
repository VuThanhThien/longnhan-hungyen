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
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

export default function VariantSelector({ variants, selectedId, onSelect }: VariantSelectorProps) {
  const activeVariants = variants.filter((v) => v.active || v.isActive);

  if (activeVariants.length === 0) {
    return <p className="text-sm text-gray-500">Sản phẩm hiện chưa có loại nào.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-gray-700">Chọn loại:</p>
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
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                isSelected
                  ? 'border-green-600 bg-green-50 text-green-800'
                  : outOfStock
                  ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-green-400'
              }`}
            >
              <span>{variant.label ?? variant.name}</span>
              <span className="ml-2 text-green-700 font-semibold">{formatPrice(variant.price)}</span>
              {outOfStock && <span className="ml-1 text-xs text-red-400">(Hết hàng)</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
