'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  VoucherForm,
  type VoucherFormValues,
} from '@/components/vouchers/voucher-form';
import { adminClientPost } from '@/lib/admin-client';
import { extractErrorMessage } from '@/lib/http/extract-error-message';
import { useState } from 'react';

export default function NewVoucherPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(values: VoucherFormValues) {
    try {
      setIsSubmitting(true);
      await adminClientPost('/vouchers', {
        ...values,
        expiresAt: values.expiresAt || null,
        minOrderAmount: values.minOrderAmount ?? null,
        maxUses: values.maxUses ?? null,
      });
      toast.success('Đã tạo mã giảm giá');
      router.push('/vouchers');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header title="Tạo mã giảm giá" />
      <main className="flex-1 overflow-y-auto p-6">
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle className="text-base">Thông tin mã giảm giá</CardTitle>
          </CardHeader>
          <CardContent>
            <VoucherForm
              submitLabel="Tạo mã"
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
