'use client';

import { useMemo, useState } from 'react';
import type { Product } from '@longnhan/types';
import { MediaUrlPicker } from '@/components/media/media-url-picker';

interface ProductFormProps {
  initialProduct?: Product;
  submitLabel: string;
  action: (formData: FormData) => void | Promise<void>;
}

interface VariantDraft {
  label: string;
  price: number;
  stock: number;
  weightG?: number;
  skuCode?: string;
  sortOrder: number;
  active: boolean;
}

export function ProductForm({ initialProduct, submitLabel, action }: ProductFormProps) {
  const [featuredImageUrl, setFeaturedImageUrl] = useState(initialProduct?.featuredImageUrl || '');
  const [variants, setVariants] = useState<VariantDraft[]>(
    initialProduct?.variants?.map((variant) => ({
      label: variant.label,
      price: variant.price,
      stock: variant.stock,
      weightG: variant.weightG || undefined,
      skuCode: variant.skuCode || undefined,
      sortOrder: variant.sortOrder,
      active: variant.active,
    })) || [{ label: '', price: 0, stock: 0, sortOrder: 0, active: true }],
  );

  const variantsJson = useMemo(() => JSON.stringify(variants), [variants]);

  function updateVariant(index: number, key: keyof VariantDraft, value: string | number | boolean) {
    setVariants((prev) => prev.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item)));
  }

  return (
    <form action={action} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm text-gray-600">Tên sản phẩm</label>
          <input
            name="name"
            defaultValue={initialProduct?.name || ''}
            className="h-10 w-full rounded-md border border-gray-200 px-3 text-sm"
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-gray-600">Danh mục</label>
          <input
            name="category"
            defaultValue={initialProduct?.category || 'long-nhan'}
            className="h-10 w-full rounded-md border border-gray-200 px-3 text-sm"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-1">
          <label className="text-sm text-gray-600">Giá gốc</label>
          <input
            type="number"
            min={0}
            name="basePrice"
            defaultValue={initialProduct?.basePrice || 0}
            className="h-10 w-full rounded-md border border-gray-200 px-3 text-sm"
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-gray-600">Video URL</label>
          <input
            name="videoUrl"
            defaultValue={initialProduct?.videoUrl || ''}
            className="h-10 w-full rounded-md border border-gray-200 px-3 text-sm"
          />
        </div>
        <div className="flex items-end">
          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" name="active" defaultChecked={initialProduct?.active ?? true} />
            Kích hoạt sản phẩm
          </label>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm text-gray-600">Mô tả</label>
        <textarea
          name="description"
          rows={4}
          defaultValue={initialProduct?.description || ''}
          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-gray-600">Ảnh đại diện</label>
        <MediaUrlPicker value={featuredImageUrl} onChange={setFeaturedImageUrl} folder="products" />
        <input type="hidden" name="featuredImageUrl" value={featuredImageUrl} />
      </div>

      <div className="space-y-1">
        <label className="text-sm text-gray-600">Danh sách ảnh (mỗi dòng 1 URL)</label>
        <textarea
          name="images"
          rows={4}
          defaultValue={initialProduct?.images?.join('\n') || ''}
          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Biến thể sản phẩm</h3>
          <button
            type="button"
            className="rounded-md border border-gray-200 px-3 py-1 text-sm hover:bg-gray-50"
            onClick={() =>
              setVariants((prev) => [
                ...prev,
                { label: '', price: 0, stock: 0, sortOrder: prev.length, active: true },
              ])
            }
          >
            + Thêm biến thể
          </button>
        </div>

        {variants.map((variant, index) => (
          <div key={index} className="grid grid-cols-1 gap-3 rounded-md border border-gray-200 p-3 md:grid-cols-6">
            <input placeholder="Tên biến thể" value={variant.label} onChange={(event) => updateVariant(index, 'label', event.target.value)} className="h-9 rounded-md border border-gray-200 px-2 text-sm md:col-span-2" />
            <input type="number" min={0} placeholder="Giá" value={variant.price} onChange={(event) => updateVariant(index, 'price', Number(event.target.value || 0))} className="h-9 rounded-md border border-gray-200 px-2 text-sm" />
            <input type="number" min={0} placeholder="Tồn kho" value={variant.stock} onChange={(event) => updateVariant(index, 'stock', Number(event.target.value || 0))} className="h-9 rounded-md border border-gray-200 px-2 text-sm" />
            <input type="number" min={0} placeholder="Khối lượng(g)" value={variant.weightG || ''} onChange={(event) => updateVariant(index, 'weightG', Number(event.target.value || 0))} className="h-9 rounded-md border border-gray-200 px-2 text-sm" />
            <input placeholder="SKU" value={variant.skuCode || ''} onChange={(event) => updateVariant(index, 'skuCode', event.target.value)} className="h-9 rounded-md border border-gray-200 px-2 text-sm" />
          </div>
        ))}
      </div>

      <input type="hidden" name="variantsJson" value={variantsJson} />
      <button type="submit" className="inline-flex h-10 items-center rounded-md bg-green-600 px-4 text-sm font-medium text-white hover:bg-green-700">
        {submitLabel}
      </button>
    </form>
  );
}
