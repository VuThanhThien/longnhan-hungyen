'use client';

import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { TransactionStatus, type Transaction } from '@longnhan/types';
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

const schema = z.object({
  status: z.nativeEnum(TransactionStatus),
  occurredAt: z.string().min(1),
  referenceNo: z.string().max(100).optional(),
  referenceNote: z.string().optional(),
});

type Values = z.infer<typeof schema>;

interface Props {
  orderId: string;
  transaction: Transaction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTransactionDialog({
  orderId,
  transaction,
  open,
  onOpenChange,
}: Props) {
  const qc = useQueryClient();
  const form = useForm<Values>({
    resolver: zodResolver(schema) as unknown as Resolver<Values>,
    defaultValues: {
      status: transaction.status,
      occurredAt: toLocalIso(transaction.occurredAt),
      referenceNo: transaction.referenceNo ?? '',
      referenceNote: transaction.referenceNote ?? '',
    },
  });

  const mutation = useMutation({
    mutationFn: (values: Values) =>
      ordersApi.updateTransaction(transaction.id, {
        status: values.status,
        occurredAt: new Date(values.occurredAt).toISOString(),
        referenceNo: values.referenceNo || null,
        referenceNote: values.referenceNote || null,
      }),
    onSuccess: async () => {
      toast.success('Đã cập nhật giao dịch');
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
          <DialogTitle>Sửa giao dịch</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
            className="space-y-3"
          >
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trạng thái</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="h-10 w-full rounded-md border border-border px-3 text-sm"
                    >
                      {Object.values(TransactionStatus).map((s) => (
                        <option key={s} value={s}>
                          {s}
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
                Lưu
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function toLocalIso(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}
