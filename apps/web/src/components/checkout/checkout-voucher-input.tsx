'use client';

import { useState, useTransition } from 'react';
import { Loader2 } from 'lucide-react';

import { validateVoucher } from '@/actions/voucher-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatVnd } from '@/lib/format-vnd';
import { cn } from '@/lib/utils';

type AppliedVoucher = {
  code: string;
  discountAmount: number;
};

interface CheckoutVoucherInputProps {
  orderTotal: number;
  phone: string;
  appliedVoucher: AppliedVoucher | null;
  onVoucherApplied: (discountAmount: number, code: string) => void;
  onVoucherRemoved: () => void;
}

const fieldClass =
  'border-(--brand-forest)/15 bg-(--brand-cream) text-(--brand-forest) placeholder:text-(--brand-forest)/50 focus-visible:ring-(--brand-gold) focus-visible:ring-offset-(--brand-cream)';

export function CheckoutVoucherInput({
  orderTotal,
  phone,
  appliedVoucher,
  onVoucherApplied,
  onVoucherRemoved,
}: CheckoutVoucherInputProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleApply = () => {
    setError(null);
    const trimmed = code.trim();
    if (!trimmed) {
      setError('Vui lòng nhập mã giảm giá');
      return;
    }
    if (!phone.trim()) {
      setError('Vui lòng nhập số điện thoại trước');
      return;
    }

    startTransition(async () => {
      const result = await validateVoucher(trimmed, orderTotal, phone);
      if (result.valid) {
        onVoucherApplied(result.discountAmount, trimmed.toUpperCase());
        setCode('');
        setError(null);
      } else {
        setError(result.message ?? 'Mã giảm giá không hợp lệ');
      }
    });
  };

  const handleRemove = () => {
    onVoucherRemoved();
    setError(null);
    setCode('');
  };

  if (appliedVoucher) {
    return (
      <div className="rounded-xl border border-(--brand-leaf)/40 bg-(--brand-leaf)/10 p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-(--brand-forest)">
              Đã áp dụng: {appliedVoucher.code}
            </div>
            <div className="text-xs text-(--brand-forest-muted)">
              Giảm {formatVnd(appliedVoucher.discountAmount)}
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="shrink-0 text-sm font-semibold text-red-600 underline underline-offset-2 hover:text-red-700"
          >
            Xóa
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-(--brand-forest)/10 bg-(--brand-gold)/10 p-3">
      <div className="flex gap-2">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleApply();
            }
          }}
          placeholder="Nhập mã giảm giá"
          className={cn(fieldClass, 'h-11 flex-1 uppercase')}
          disabled={isPending}
          autoCapitalize="characters"
          autoComplete="off"
        />
        <Button
          type="button"
          onClick={handleApply}
          disabled={isPending}
          className="h-11 rounded-xl border-2 border-(--brand-gold)/40 bg-(--brand-gold)/20 text-sm font-semibold text-(--brand-forest) hover:bg-(--brand-gold)/30"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Áp dụng'}
        </Button>
      </div>
      {error ? (
        <p className="mt-2 text-xs font-medium text-red-600">{error}</p>
      ) : null}
    </div>
  );
}
