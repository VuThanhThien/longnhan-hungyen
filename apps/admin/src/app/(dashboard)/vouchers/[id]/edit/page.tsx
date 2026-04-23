'use client';

import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  VoucherForm,
  type VoucherFormValues,
} from '@/components/vouchers/voucher-form';
import { adminClientGet, adminClientPatch } from '@/lib/admin-client';
import { adminQueryKeys } from '@/lib/query-keys';
import { extractErrorMessage } from '@/lib/http/extract-error-message';
import { useState } from 'react';

type Voucher = {
  id: string;
  code: string;
  description: string | null;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number | null;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt: string | null;
};

function toDatetimeLocal(val: string | Date | null | undefined): string {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  // Format: YYYY-MM-DDTHH:mm
  return d.toISOString().slice(0, 16);
}

export default function VoucherEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: voucher, isLoading } = useQuery({
    queryKey: adminQueryKeys.vouchers.detail(id),
    queryFn: () => adminClientGet<Voucher>(`/vouchers/${id}`),
    enabled: Boolean(id),
  });

  async function handleSubmit(values: VoucherFormValues) {
    try {
      setIsSubmitting(true);
      await adminClientPatch(`/vouchers/${id}`, {
        ...values,
        expiresAt: values.expiresAt || null,
        minOrderAmount: values.minOrderAmount ?? null,
        maxUses: values.maxUses ?? null,
      });
      toast.success('Đã cập nhật mã giảm giá');
      router.push(`/vouchers/${id}`);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title="Chỉnh sửa mã giảm giá" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="text-sm text-muted-foreground">Đang tải…</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header
        title={voucher ? `Sửa: ${voucher.code}` : 'Chỉnh sửa mã giảm giá'}
      />
      <main className="flex-1 overflow-y-auto p-6">
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle className="text-base">Thông tin mã giảm giá</CardTitle>
          </CardHeader>
          <CardContent>
            {voucher ? (
              <VoucherForm
                initial={{
                  code: voucher.code,
                  description: voucher.description ?? '',
                  discountType: voucher.discountType,
                  discountValue: voucher.discountValue,
                  minOrderAmount: voucher.minOrderAmount,
                  maxUses: voucher.maxUses,
                  isActive: voucher.isActive,
                  expiresAt: toDatetimeLocal(voucher.expiresAt),
                }}
                submitLabel="Lưu thay đổi"
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
              />
            ) : (
              <div className="text-sm text-destructive">
                Không tìm thấy mã giảm giá
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
