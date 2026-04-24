'use client';

import { useEffect } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  TransactionMethod,
  TransactionStatus,
  TransactionType,
  type CreateTransactionDto,
} from '@longnhan/types';
import {
  Dialog,
  DialogContent,
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
import { Button } from '@/components/ui/button';
import { ordersApi } from '@/features/orders/api/orders-api';
import { adminQueryKeys } from '@/lib/query-keys';
import { extractErrorMessage } from '@/lib/http/extract-error-message';

const schema = z
  .object({
    type: z.nativeEnum(TransactionType),
    method: z.nativeEnum(TransactionMethod).optional().nullable(),
    amount: z.coerce.number().int().positive('Số tiền phải > 0'),
    status: z
      .nativeEnum(TransactionStatus)
      .default(TransactionStatus.COMPLETED),
    occurredAt: z.string().min(1, 'Bắt buộc'),
    referenceNo: z.string().max(100).optional(),
    referenceNote: z.string().optional(),
  })
  .refine(
    (v) =>
      !(
        (v.type === TransactionType.PAYMENT ||
          v.type === TransactionType.REFUND) &&
        !v.method
      ),
    { message: 'Phương thức bắt buộc với payment/refund', path: ['method'] },
  );

export type AddTransactionFormValues = z.infer<typeof schema>;

interface Props {
  orderId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: Partial<AddTransactionFormValues>;
  title?: string;
  submitLabel?: string;
}

export function AddTransactionDialog({
  orderId,
  open,
  onOpenChange,
  defaultValues,
  title = 'Thêm giao dịch',
  submitLabel = 'Lưu',
}: Props) {
  const qc = useQueryClient();
  const form = useForm<AddTransactionFormValues>({
    resolver: zodResolver(
      schema,
    ) as unknown as Resolver<AddTransactionFormValues>,
    defaultValues: {
      type: TransactionType.PAYMENT,
      method: TransactionMethod.BANK_TRANSFER,
      amount: 0,
      status: TransactionStatus.COMPLETED,
      occurredAt: nowLocalIso(),
      referenceNo: '',
      referenceNote: '',
      ...defaultValues,
    },
  });

  useEffect(() => {
    if (open) form.reset({ ...form.getValues(), ...defaultValues });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const mutation = useMutation({
    mutationFn: (values: AddTransactionFormValues) => {
      const payload: Omit<CreateTransactionDto, 'orderId'> = {
        type: values.type,
        method: values.method ?? null,
        amount: values.amount,
        direction: 'in' as never, // server derives; kept for type compat
        status: values.status,
        occurredAt: new Date(values.occurredAt).toISOString(),
        referenceNo: values.referenceNo || null,
        referenceNote: values.referenceNote || null,
      };
      return ordersApi.createTransaction(orderId, payload);
    },
    onSuccess: async () => {
      toast.success('Đã thêm giao dịch');
      await Promise.all([
        qc.invalidateQueries({
          queryKey: adminQueryKeys.orders.transactions(orderId),
        }),
        qc.invalidateQueries({ queryKey: adminQueryKeys.transactions.all }),
        qc.invalidateQueries({ queryKey: adminQueryKeys.orders.all }),
      ]);
      onOpenChange(false);
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
            className="space-y-3"
          >
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loại</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="h-10 w-full rounded-md border border-border px-3 text-sm"
                    >
                      {Object.values(TransactionType).map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phương thức</FormLabel>
                  <FormControl>
                    <select
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value || null)}
                      className="h-10 w-full rounded-md border border-border px-3 text-sm"
                    >
                      <option value="">—</option>
                      {Object.values(TransactionMethod).map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số tiền (VND)</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="occurredAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thời điểm</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="referenceNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mã tham chiếu</FormLabel>
                  <FormControl>
                    <Input maxLength={100} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="referenceNote"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ghi chú</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={mutation.isPending}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {submitLabel}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function nowLocalIso() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}
