'use client';

import { Loader2 } from 'lucide-react';
import { useForm, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import type { Category } from '@longnhan/types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  const form = useForm<CategoryFormValues>({
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
    <Form {...form}>
      <form
        id={formId}
        className="space-y-5 max-w-lg"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên hiển thị</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug (URL)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className="font-mono"
                  placeholder="vi-du-danh-muc"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sortOrder"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Thứ tự</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  min={0}
                  value={
                    Number.isFinite(field.value) ? String(field.value) : '0'
                  }
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="space-y-0">
              <div className="flex items-center gap-2">
                <FormControl>
                  <Checkbox
                    checked={Boolean(field.value)}
                    onCheckedChange={(checked) =>
                      field.onChange(checked === true)
                    }
                  />
                </FormControl>
                <Label>Đang hoạt động</Label>
              </div>
              <FormDescription className="mt-2">
                Tắt danh mục sẽ ẩn danh mục này khỏi phần chọn danh mục.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {hideSubmitButton ? null : (
          <Button
            type="submit"
            variant="outline"
            disabled={isSubmitting}
            className="min-w-40"
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isSubmitting ? 'Đang lưu…' : submitLabel}
          </Button>
        )}
      </form>
    </Form>
  );
}
