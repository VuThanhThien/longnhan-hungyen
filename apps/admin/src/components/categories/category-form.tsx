'use client';

import { useForm, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import type { Category } from '@longnhan/types';
import {
  categoryFormSchema,
  type CategoryFormValues,
} from './category-form.constant';

export interface CategoryFormProps {
  initial?: Category | null;
  submitLabel: string;
  onSubmit: (values: CategoryFormValues) => void | Promise<void>;
  isSubmitting?: boolean;
  formId?: string;
  hideSubmitButton?: boolean;
}

export function CategoryForm({
  initial,
  submitLabel,
  onSubmit,
  isSubmitting,
  formId,
  hideSubmitButton = false,
}: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: yupResolver(
      categoryFormSchema,
    ) as unknown as Resolver<CategoryFormValues>,
    defaultValues: {
      name: initial?.name ?? '',
      slug: initial?.slug ?? '',
      sortOrder: initial?.sortOrder ?? 0,
      active: initial?.active ?? true,
    },
  });

  return (
    <form
      id={formId}
      className="space-y-4 max-w-lg"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="space-y-1">
        <label className="text-sm text-muted-foreground" htmlFor="cat-name">
          Tên hiển thị
        </label>
        <input
          id="cat-name"
          {...register('name')}
          className="h-10 w-full rounded-md border border-border px-3 text-sm"
        />
        {errors.name?.message ? (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        ) : null}
      </div>

      <div className="space-y-1">
        <label className="text-sm text-muted-foreground" htmlFor="cat-slug">
          Slug (URL)
        </label>
        <input
          id="cat-slug"
          {...register('slug')}
          className="h-10 w-full rounded-md border border-border px-3 font-mono text-sm"
          placeholder="vi-du-danh-muc"
        />
        {errors.slug?.message ? (
          <p className="text-xs text-destructive">{errors.slug.message}</p>
        ) : null}
      </div>

      <div className="space-y-1">
        <label className="text-sm text-muted-foreground" htmlFor="cat-sort">
          Thứ tự
        </label>
        <input
          id="cat-sort"
          type="number"
          min={0}
          {...register('sortOrder', { valueAsNumber: true })}
          className="h-10 w-full rounded-md border border-border px-3 text-sm"
        />
        {errors.sortOrder?.message ? (
          <p className="text-xs text-destructive">
            {String(errors.sortOrder.message)}
          </p>
        ) : null}
      </div>

      <label className="inline-flex items-center gap-2 text-sm text-foreground/90">
        <input type="checkbox" {...register('active')} />
        Đang hoạt động
      </label>

      {hideSubmitButton ? null : (
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors duration-150 hover:text-destructive disabled:opacity-60"
        >
          {isSubmitting ? 'Đang lưu…' : submitLabel}
        </button>
      )}
    </form>
  );
}
