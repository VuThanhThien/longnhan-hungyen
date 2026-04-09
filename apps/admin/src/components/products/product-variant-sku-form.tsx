'use client';

import { useState } from 'react';
import type { Product } from '@longnhan/types';

import { useUpdateProductVariantSkuMutation } from '@/app/(dashboard)/products/_shared/use-admin-product-mutations';

interface ProductVariantSkuFormProps {
  productId: string;
  variants: Product['variants'];
}

export function ProductVariantSkuForm({ productId, variants }: ProductVariantSkuFormProps) {
  const mutation = useUpdateProductVariantSkuMutation(productId);

  // Only store edits. Saved values always come from `variants`.
  const [editsById, setEditsById] = useState<Record<string, string>>({});

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 rounded-md border border-gray-200 p-3 md:grid-cols-6">
        <div className="md:col-span-2">Biến thể</div>
        <div className="md:col-span-2">SKU</div>
        <div className="md:col-span-2">Thao tác</div>
      </div>

      {(variants ?? []).map((variant) => {
        const currentSku = editsById[variant.id] ?? (variant.skuCode ?? '');
        const savedSku = variant.skuCode ?? '';
        const isDirty = currentSku !== savedSku;

        return (
          <div
            key={variant.id}
            className="grid grid-cols-1 items-center gap-3 rounded-md border border-gray-200 p-3 md:grid-cols-6"
          >
            <div className="text-sm md:col-span-2">
              <div className="font-medium text-gray-900">{variant.label}</div>
              <div className="text-xs text-gray-500">{variant.id}</div>
            </div>

            <input
              placeholder="SKU"
              value={currentSku}
              onChange={(event) =>
                setEditsById((prev) => ({
                  ...prev,
                  [variant.id]: event.target.value,
                }))
              }
              className="h-9 rounded-md border border-gray-200 px-2 text-sm md:col-span-2"
            />

            <div className="flex items-center gap-2 md:col-span-2">
              <button
                type="button"
                disabled={mutation.isPending || !isDirty}
                className="inline-flex h-9 items-center rounded-md bg-green-600 px-3 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
                onClick={async () => {
                  await mutation.mutateAsync({ variantId: variant.id, skuCode: currentSku });
                  setEditsById((prev) => {
                    const next = { ...prev };
                    delete next[variant.id];
                    return next;
                  });
                }}
              >
                Lưu SKU
              </button>
              {isDirty ? <span className="text-xs text-amber-700">Chưa lưu</span> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

