'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Product } from '@longnhan/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Trash2 } from 'lucide-react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

import {
  useCreateProductVariantMutation,
  useDeleteProductVariantMutation,
  useUpdateProductVariantMutation,
} from '@/app/(dashboard)/products/_shared/use-admin-product-mutations';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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

const skuCodeSchema = z
  .string()
  .trim()
  .max(64, 'SKU tối đa 64 ký tự')
  .regex(/^[a-zA-Z0-9._-]*$/, 'SKU chỉ gồm chữ/số và . _ -');

const variantSchema = z.object({
  label: z.string().trim().min(1, 'Vui lòng nhập tên biến thể'),
  price: z.coerce.number().min(0, 'Giá phải ≥ 0'),
  stock: z.coerce
    .number()
    .int('Tồn kho phải là số nguyên')
    .min(0, 'Tồn kho phải ≥ 0'),
  weightG: z
    .union([z.coerce.number().min(0, 'Khối lượng phải ≥ 0'), z.null()])
    .optional()
    .transform((v) => v ?? null),
  skuCode: z
    .union([skuCodeSchema, z.literal('')])
    .optional()
    .transform((v) => (v ?? '').trim()),
  sortOrder: z.coerce.number().int('Sort order phải là số nguyên').min(0),
  active: z.boolean(),
});

const variantsCrudFormSchema = z.object({
  variants: z.record(z.string(), variantSchema),
  create: variantSchema,
});

type VariantsCrudFormInput = z.input<typeof variantsCrudFormSchema>;

function normalizeVariantInput(input: {
  label: string;
  price: unknown;
  stock: unknown;
  weightG?: unknown;
  skuCode?: string | undefined;
  sortOrder: unknown;
  active: boolean;
}): {
  label: string;
  price: number;
  stock: number;
  weightG: number | null;
  skuCode: string;
  sortOrder: number;
  active: boolean;
} {
  return {
    label: input.label.trim(),
    price: Number(input.price ?? 0),
    stock: Number(input.stock ?? 0),
    weightG:
      input.weightG === null ||
      input.weightG === undefined ||
      input.weightG === ''
        ? null
        : Number(input.weightG),
    skuCode: (input.skuCode ?? '').trim(),
    sortOrder: Number(input.sortOrder ?? 0),
    active: Boolean(input.active),
  };
}

export function ProductVariantsCrudForm({
  productId,
  variants,
}: ProductVariantsCrudFormProps) {
  const createMutation = useCreateProductVariantMutation(productId);
  const updateMutation = useUpdateProductVariantMutation(productId);
  const deleteMutation = useDeleteProductVariantMutation(productId);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [savingVariantId, setSavingVariantId] = useState<string | null>(null);
  const [deletingVariantId, setDeletingVariantId] = useState<string | null>(
    null,
  );

  const isBusy =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  const defaultValues = useMemo<VariantsCrudFormInput>(() => {
    const variantValues = Object.fromEntries(
      (variants ?? []).map((v) => {
        const d = toDraft(v);
        return [
          v.id,
          {
            label: d.label,
            price: d.price,
            stock: d.stock,
            weightG: d.weightG,
            skuCode: d.skuCode,
            sortOrder: d.sortOrder,
            active: d.active,
          },
        ] as const;
      }),
    );

    return {
      variants: variantValues,
      create: {
        label: '',
        price: 0,
        stock: 0,
        weightG: null,
        skuCode: '',
        sortOrder: (variants ?? []).length,
        active: true,
      },
    };
  }, [variants]);

  const form = useForm<VariantsCrudFormInput>({
    resolver: zodResolver(variantsCrudFormSchema),
    defaultValues,
    mode: 'onChange',
  });

  useEffect(() => {
    form.reset(defaultValues, { keepDirtyValues: true });
  }, [defaultValues, form]);

  return (
    <Form {...form}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm text-muted-foreground">
            Thêm / sửa / xoá biến thể (tách riêng khỏi cập nhật sản phẩm).
          </div>
          <Button
            type="button"
            disabled={isBusy}
            onClick={() => {
              form.resetField('create', {
                defaultValue: {
                  label: '',
                  price: 0,
                  stock: 0,
                  weightG: null,
                  skuCode: '',
                  sortOrder: (variants ?? []).length,
                  active: true,
                },
              });
              setIsCreateOpen(true);
            }}
            variant="outline"
            size="sm"
          >
            + Thêm biến thể
          </Button>
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
              <FormField
                control={form.control}
                name="create.label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên biến thể</FormLabel>
                    <FormControl>
                      <Input placeholder="VD: 500g, 1kg…" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="create.price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giá</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          inputMode="numeric"
                          {...field}
                          value={String(field.value ?? 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="create.stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tồn kho</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          inputMode="numeric"
                          {...field}
                          value={String(field.value ?? 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="create.weightG"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Khối lượng (g)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          inputMode="numeric"
                          value={
                            field.value === null
                              ? ''
                              : String(field.value ?? '')
                          }
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ''
                                ? null
                                : Number(e.target.value),
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="create.sortOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sort order</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          inputMode="numeric"
                          {...field}
                          value={String(field.value ?? 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="create.skuCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU (tuỳ chọn)</FormLabel>
                    <FormControl>
                      <Input placeholder="VD: LN-500G-001" {...field} />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">
                      Để trống nếu chưa có SKU (có thể cập nhật sau).
                    </p>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="create.active"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0 rounded-md border border-border p-3">
                    <FormControl>
                      <Checkbox
                        checked={Boolean(field.value)}
                        onCheckedChange={(value) =>
                          field.onChange(Boolean(value))
                        }
                      />
                    </FormControl>
                    <FormLabel className="cursor-pointer">
                      Kích hoạt biến thể
                    </FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                disabled={createMutation.isPending}
              >
                Huỷ
              </Button>
              <Button
                type="button"
                disabled={createMutation.isPending}
                onClick={async () => {
                  const ok = await form.trigger('create');
                  if (!ok) return;

                  const v = form.getValues('create');
                  const normalized = normalizeVariantInput(v);
                  const trimmedSku = normalized.skuCode;

                  await createMutation.mutateAsync({
                    label: normalized.label,
                    price: normalized.price,
                    stock: normalized.stock,
                    weightG: normalized.weightG,
                    ...(trimmedSku ? { skuCode: trimmedSku } : {}),
                    sortOrder: normalized.sortOrder,
                    active: normalized.active,
                  });

                  setIsCreateOpen(false);
                }}
              >
                {createMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                Lưu biến thể
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[220px]">Tên</TableHead>
              <TableHead className="w-[120px]">Giá</TableHead>
              <TableHead className="w-[110px]">Tồn</TableHead>
              <TableHead className="w-[140px]">Khối lượng</TableHead>
              <TableHead className="min-w-[200px]">SKU</TableHead>
              <TableHead className="w-[90px]">Sort</TableHead>
              <TableHead className="w-[90px]">Active</TableHead>
              <TableHead className="w-[200px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(variants ?? []).map((variant) => (
              <ProductVariantRow
                key={variant.id}
                variant={variant}
                form={form}
                isBusy={isBusy}
                savingVariantId={savingVariantId}
                deletingVariantId={deletingVariantId}
                onSave={async () => {
                  const prefix = `variants.${variant.id}` as const;
                  const ok = await form.trigger(prefix);
                  if (!ok) return;

                  const next = form.getValues(prefix);
                  const normalized = normalizeVariantInput(next);
                  try {
                    setSavingVariantId(variant.id);
                    await updateMutation.mutateAsync({
                      variantId: variant.id,
                      patch: {
                        label: normalized.label,
                        price: normalized.price,
                        stock: normalized.stock,
                        weightG: normalized.weightG,
                        skuCode: normalized.skuCode,
                        sortOrder: normalized.sortOrder,
                        active: normalized.active,
                      },
                    });
                    form.resetField(prefix, {
                      defaultValue: {
                        ...normalized,
                      },
                    });
                  } finally {
                    setSavingVariantId(null);
                  }
                }}
                onDelete={async () => {
                  try {
                    setDeletingVariantId(variant.id);
                    await deleteMutation.mutateAsync(variant.id);
                  } finally {
                    setDeletingVariantId(null);
                  }
                }}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </Form>
  );
}

function ProductVariantRow(props: {
  variant: NonNullable<Product['variants']>[number];
  form: UseFormReturn<VariantsCrudFormInput>;
  isBusy: boolean;
  savingVariantId: string | null;
  deletingVariantId: string | null;
  onSave: () => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const {
    variant,
    form,
    isBusy,
    savingVariantId,
    deletingVariantId,
    onSave,
    onDelete,
  } = props;

  const prefix = `variants.${variant.id}` as const;
  const watched = form.watch(prefix);
  const baseline = useMemo(() => toDraft(variant), [variant]);

  const dirty =
    (watched?.label ?? '').trim() !== baseline.label ||
    Number(watched?.price ?? 0) !== baseline.price ||
    Number(watched?.stock ?? 0) !== baseline.stock ||
    (watched?.weightG === '' ? null : (watched?.weightG ?? null)) !==
      baseline.weightG ||
    (watched?.skuCode ?? '').trim() !== baseline.skuCode ||
    Number(watched?.sortOrder ?? 0) !== baseline.sortOrder ||
    Boolean(watched?.active ?? false) !== baseline.active;

  const isSavingThisRow = savingVariantId === variant.id;
  const isDeletingThisRow = deletingVariantId === variant.id;

  return (
    <TableRow className="align-top">
      <TableCell className="py-3">
        <FormField
          control={form.control}
          name={`${prefix}.label` as const}
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </TableCell>

      <TableCell className="py-3">
        <FormField
          control={form.control}
          name={`${prefix}.price` as const}
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  {...field}
                  value={String(field.value ?? 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </TableCell>

      <TableCell className="py-3">
        <FormField
          control={form.control}
          name={`${prefix}.stock` as const}
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  {...field}
                  value={String(field.value ?? 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </TableCell>

      <TableCell className="py-3">
        <FormField
          control={form.control}
          name={`${prefix}.weightG` as const}
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={field.value === null ? '' : String(field.value ?? '')}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === '' ? null : Number(e.target.value),
                    )
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </TableCell>

      <TableCell className="py-3">
        <FormField
          control={form.control}
          name={`${prefix}.skuCode` as const}
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormControl>
                <Input
                  placeholder="VD: LN-500G-001"
                  {...field}
                  value={(field.value ?? '') as string}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </TableCell>

      <TableCell className="py-3">
        <FormField
          control={form.control}
          name={`${prefix}.sortOrder` as const}
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  {...field}
                  value={String(field.value ?? 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </TableCell>

      <TableCell className="py-3">
        <FormField
          control={form.control}
          name={`${prefix}.active` as const}
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormControl>
                <Checkbox
                  checked={Boolean(field.value)}
                  onCheckedChange={(value) => field.onChange(Boolean(value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </TableCell>

      <TableCell className="py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isBusy || !dirty}
            onClick={onSave}
          >
            {isSavingThisRow ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            Lưu
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isBusy}
            onClick={onDelete}
            className="text-red-500"
          >
            {isDeletingThisRow ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 text-red-500" />
            )}
            Xoá
          </Button>
        </div>
        {dirty ? (
          <div className="mt-2 text-xs text-amber-700">
            Có thay đổi chưa lưu
          </div>
        ) : null}
      </TableCell>
    </TableRow>
  );
}
