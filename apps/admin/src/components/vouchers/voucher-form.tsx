'use client';

import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const voucherSchema = z
  .object({
    code: z
      .string()
      .min(1, 'Vui lòng nhập mã giảm giá')
      .max(50, 'Tối đa 50 ký tự')
      .regex(/^[A-Z0-9_-]+$/, 'Chỉ dùng chữ in hoa, số, gạch ngang, gạch dưới'),
    description: z.string().max(255, 'Tối đa 255 ký tự').optional(),
    discountType: z.enum(['percentage', 'fixed']),
    discountValue: z
      .number({ error: 'Vui lòng nhập giá trị giảm' })
      .positive('Giá trị phải lớn hơn 0'),
    minOrderAmount: z.number().min(0).nullable().optional(),
    maxUses: z.number().int().min(1).nullable().optional(),
    isActive: z.boolean(),
    expiresAt: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.discountType === 'percentage') {
      if (data.discountValue < 1 || data.discountValue > 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['discountValue'],
          message: 'Phần trăm giảm giá phải từ 1 đến 100',
        });
      }
    }
  });

export type VoucherFormValues = z.infer<typeof voucherSchema>;

export interface VoucherFormProps {
  initial?: Partial<VoucherFormValues> | null;
  submitLabel: string;
  onSubmit: (values: VoucherFormValues) => void | Promise<void>;
  isSubmitting?: boolean;
}

export function VoucherForm({
  initial,
  submitLabel,
  onSubmit,
  isSubmitting,
}: VoucherFormProps) {
  const form = useForm<VoucherFormValues>({
    resolver: zodResolver(
      voucherSchema,
    ) as unknown as Resolver<VoucherFormValues>,
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    defaultValues: {
      code: initial?.code ?? '',
      description: initial?.description ?? '',
      discountType: initial?.discountType ?? 'percentage',
      discountValue: initial?.discountValue ?? 0,
      minOrderAmount: initial?.minOrderAmount ?? null,
      maxUses: initial?.maxUses ?? null,
      isActive: initial?.isActive ?? true,
      expiresAt: initial?.expiresAt ?? '',
    },
  });

  const discountType = form.watch('discountType');

  return (
    <Form {...form}>
      <form
        className="space-y-5 max-w-lg"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mã giảm giá</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="VD: SUMMER2025"
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mô tả (tuỳ chọn)</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value ?? ''}
                  rows={2}
                  placeholder="Mô tả ngắn về mã giảm giá"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="discountType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Loại giảm giá</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="percentage">Phần trăm (%)</SelectItem>
                  <SelectItem value="fixed">Số tiền (₫)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="discountValue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Giá trị giảm{' '}
                {discountType === 'percentage' ? '(1–100%)' : '(₫)'}
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  max={discountType === 'percentage' ? 100 : undefined}
                  step={1}
                  value={field.value ?? ''}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === '' ? 0 : Number(e.target.value),
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
          name="minOrderAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Đơn hàng tối thiểu (₫, tuỳ chọn)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  step={1000}
                  value={field.value ?? ''}
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

        <FormField
          control={form.control}
          name="maxUses"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Số lần tối đa (tuỳ chọn)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  step={1}
                  value={field.value ?? ''}
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

        <FormField
          control={form.control}
          name="expiresAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hết hạn (tuỳ chọn)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ''}
                  type="datetime-local"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem>
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="h-4 w-4 rounded border-border"
                />
                <span>Kích hoạt</span>
              </label>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          {submitLabel}
        </Button>
      </form>
    </Form>
  );
}
