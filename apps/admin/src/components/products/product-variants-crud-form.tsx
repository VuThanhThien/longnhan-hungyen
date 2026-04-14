'use client';

import { useMemo, useState } from 'react';
import type { Product } from '@longnhan/types';

import {
  useCreateProductVariantMutation,
  useDeleteProductVariantMutation,
  useUpdateProductVariantMutation,
} from '@/app/(dashboard)/products/_shared/use-admin-product-mutations';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface VariantDraft {
  id: string;
  label: string;
  price: number;
  stock: number;
  weightG: number | null;
  skuCode: string;
  sortOrder: number;
  active: boolean;
}

interface ProductVariantsCrudFormProps {
  productId: string;
  variants: Product['variants'];
}

function toDraft(v: Product['variants'][number]): VariantDraft {
  return {
    id: v.id,
    label: v.label,
    price: v.price,
    stock: v.stock,
    weightG: v.weightG ?? null,
    skuCode: v.skuCode ?? '',
    sortOrder: v.sortOrder,
    active: v.active,
  };
}

export function ProductVariantsCrudForm({
  productId,
  variants,
}: ProductVariantsCrudFormProps) {
  const createMutation = useCreateProductVariantMutation(productId);
  const updateMutation = useUpdateProductVariantMutation(productId);
  const deleteMutation = useDeleteProductVariantMutation(productId);

  const byId = useMemo(
    () => new Map((variants ?? []).map((v) => [v.id, v])),
    [variants],
  );

  const [draftById, setDraftById] = useState<Record<string, VariantDraft>>({});
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createDraft, setCreateDraft] = useState<Omit<VariantDraft, 'id'>>({
    label: '',
    price: 0,
    stock: 0,
    weightG: null,
    skuCode: '',
    sortOrder: (variants ?? []).length,
    active: true,
  });

  function getDraft(variantId: string): VariantDraft {
    const existing = draftById[variantId];
    if (existing) return existing;
    const v = byId.get(variantId);
    if (!v) {
      return {
        id: variantId,
        label: '',
        price: 0,
        stock: 0,
        weightG: null,
        skuCode: '',
        sortOrder: 0,
        active: true,
      };
    }
    return toDraft(v);
  }

  function setDraft(variantId: string, next: VariantDraft) {
    setDraftById((prev) => ({ ...prev, [variantId]: next }));
  }

  function isDirty(variantId: string) {
    const v = byId.get(variantId);
    if (!v) return true;
    const d = getDraft(variantId);
    return (
      d.label !== v.label ||
      d.price !== v.price ||
      d.stock !== v.stock ||
      (d.weightG ?? null) !== (v.weightG ?? null) ||
      (d.skuCode || '') !== (v.skuCode ?? '') ||
      d.sortOrder !== v.sortOrder ||
      d.active !== v.active
    );
  }

  const isBusy =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-gray-600">
          Thêm / sửa / xoá biến thể (tách riêng khỏi cập nhật sản phẩm).
        </div>
        <button
          type="button"
          disabled={isBusy}
          className="inline-flex h-9 items-center rounded-md border border-gray-200 px-3 text-sm hover:bg-gray-50 disabled:opacity-60"
          onClick={() => {
            setCreateDraft({
              label: '',
              price: 0,
              stock: 0,
              weightG: null,
              skuCode: '',
              sortOrder: (variants ?? []).length,
              active: true,
            });
            setIsCreateOpen(true);
          }}
        >
          + Thêm biến thể
        </button>
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm biến thể</DialogTitle>
            <DialogDescription>
              Nhập thông tin biến thể, sau đó bấm Lưu để tạo.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-1">
              <label className="text-sm text-gray-600">Tên biến thể</label>
              <input
                className="h-10 w-full rounded-md border border-gray-200 px-3 text-sm"
                value={createDraft.label}
                onChange={(e) =>
                  setCreateDraft((p) => ({ ...p, label: e.target.value }))
                }
                placeholder="VD: 500g, 1kg…"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm text-gray-600">Giá</label>
                <input
                  type="number"
                  min={0}
                  className="h-10 w-full rounded-md border border-gray-200 px-3 text-sm"
                  value={createDraft.price}
                  onChange={(e) =>
                    setCreateDraft((p) => ({
                      ...p,
                      price: Number(e.target.value || 0),
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-600">Tồn kho</label>
                <input
                  type="number"
                  min={0}
                  className="h-10 w-full rounded-md border border-gray-200 px-3 text-sm"
                  value={createDraft.stock}
                  onChange={(e) =>
                    setCreateDraft((p) => ({
                      ...p,
                      stock: Number(e.target.value || 0),
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm text-gray-600">Khối lượng (g)</label>
                <input
                  type="number"
                  min={0}
                  className="h-10 w-full rounded-md border border-gray-200 px-3 text-sm"
                  value={createDraft.weightG ?? ''}
                  onChange={(e) =>
                    setCreateDraft((p) => ({
                      ...p,
                      weightG:
                        e.target.value === '' ? null : Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-600">Sort order</label>
                <input
                  type="number"
                  min={0}
                  className="h-10 w-full rounded-md border border-gray-200 px-3 text-sm"
                  value={createDraft.sortOrder}
                  onChange={(e) =>
                    setCreateDraft((p) => ({
                      ...p,
                      sortOrder: Number(e.target.value || 0),
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm text-gray-600">SKU (tuỳ chọn)</label>
              <input
                className="h-10 w-full rounded-md border border-gray-200 px-3 text-sm"
                value={createDraft.skuCode}
                onChange={(e) =>
                  setCreateDraft((p) => ({ ...p, skuCode: e.target.value }))
                }
                placeholder="VD: LN-500G-001"
              />
              <p className="text-xs text-gray-500">
                Để trống nếu chưa có SKU (có thể cập nhật sau).
              </p>
            </div>

            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={createDraft.active}
                onChange={(e) =>
                  setCreateDraft((p) => ({ ...p, active: e.target.checked }))
                }
              />
              Kích hoạt biến thể
            </label>
          </div>

          <DialogFooter className="mt-2">
            <button
              type="button"
              className="inline-flex h-10 items-center rounded-md border border-gray-200 px-4 text-sm hover:bg-gray-50 disabled:opacity-60"
              onClick={() => setIsCreateOpen(false)}
              disabled={createMutation.isPending}
            >
              Huỷ
            </button>
            <button
              type="button"
              disabled={
                createMutation.isPending ||
                createDraft.label.trim().length === 0
              }
              className="inline-flex h-10 items-center rounded-md bg-green-600 px-4 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
              onClick={async () => {
                const trimmedSku = createDraft.skuCode.trim();
                await createMutation.mutateAsync({
                  label: createDraft.label.trim(),
                  price: createDraft.price,
                  stock: createDraft.stock,
                  weightG: createDraft.weightG,
                  ...(trimmedSku ? { skuCode: trimmedSku } : {}),
                  sortOrder: createDraft.sortOrder,
                  active: createDraft.active,
                });
                setIsCreateOpen(false);
              }}
            >
              {createMutation.isPending ? 'Đang lưu…' : 'Lưu biến thể'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 gap-3 rounded-md border border-gray-200 p-3 md:grid-cols-10">
        <div className="md:col-span-2">Tên</div>
        <div className="md:col-span-1">Giá</div>
        <div className="md:col-span-1">Tồn</div>
        <div className="md:col-span-1">Khối lượng</div>
        <div className="md:col-span-2">SKU</div>
        <div className="md:col-span-1">Sort</div>
        <div className="md:col-span-1">Active</div>
        <div className="md:col-span-1">Actions</div>
      </div>

      {(variants ?? []).map((v) => {
        const d = getDraft(v.id);
        const dirty = isDirty(v.id);

        return (
          <div
            key={v.id}
            className="grid grid-cols-1 items-center gap-3 rounded-md border border-gray-200 p-3 md:grid-cols-10"
          >
            <input
              className="h-9 rounded-md border border-gray-200 px-2 text-sm md:col-span-2"
              value={d.label}
              onChange={(e) => setDraft(v.id, { ...d, label: e.target.value })}
            />
            <input
              type="number"
              min={0}
              className="h-9 rounded-md border border-gray-200 px-2 text-sm md:col-span-1"
              value={d.price}
              onChange={(e) =>
                setDraft(v.id, { ...d, price: Number(e.target.value || 0) })
              }
            />
            <input
              type="number"
              min={0}
              className="h-9 rounded-md border border-gray-200 px-2 text-sm md:col-span-1"
              value={d.stock}
              onChange={(e) =>
                setDraft(v.id, { ...d, stock: Number(e.target.value || 0) })
              }
            />
            <input
              type="number"
              min={0}
              className="h-9 rounded-md border border-gray-200 px-2 text-sm md:col-span-1"
              value={d.weightG ?? ''}
              onChange={(e) =>
                setDraft(v.id, {
                  ...d,
                  weightG:
                    e.target.value === '' ? null : Number(e.target.value),
                })
              }
            />
            <input
              className="h-9 rounded-md border border-gray-200 px-2 text-sm md:col-span-2"
              value={d.skuCode}
              onChange={(e) =>
                setDraft(v.id, { ...d, skuCode: e.target.value })
              }
            />
            <input
              type="number"
              min={0}
              className="h-9 rounded-md border border-gray-200 px-2 text-sm md:col-span-1"
              value={d.sortOrder}
              onChange={(e) =>
                setDraft(v.id, { ...d, sortOrder: Number(e.target.value || 0) })
              }
            />
            <label className="flex items-center gap-2 text-sm md:col-span-1">
              <input
                type="checkbox"
                checked={d.active}
                onChange={(e) =>
                  setDraft(v.id, { ...d, active: e.target.checked })
                }
              />
              <span className="text-gray-700">Bật</span>
            </label>

            <div className="flex items-center gap-2 md:col-span-1">
              <button
                type="button"
                disabled={isBusy || !dirty}
                className="inline-flex h-9 items-center rounded-md bg-green-600 px-3 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
                onClick={async () => {
                  await updateMutation.mutateAsync({
                    variantId: v.id,
                    patch: {
                      label: d.label,
                      price: d.price,
                      stock: d.stock,
                      weightG: d.weightG,
                      skuCode: d.skuCode,
                      sortOrder: d.sortOrder,
                      active: d.active,
                    },
                  });
                  setDraftById((prev) => {
                    const next = { ...prev };
                    delete next[v.id];
                    return next;
                  });
                }}
              >
                Lưu
              </button>
              <button
                type="button"
                disabled={isBusy}
                className="inline-flex h-9 items-center rounded-md border border-red-200 px-3 text-sm text-red-700 hover:bg-red-50 disabled:opacity-60"
                onClick={() => deleteMutation.mutateAsync(v.id)}
              >
                Xoá
              </button>
            </div>

            {dirty ? (
              <div className="text-xs text-amber-700 md:col-span-10">
                Có thay đổi chưa lưu
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
