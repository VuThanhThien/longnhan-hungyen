'use client';

import { Badge } from '@/components/ui/badge';

export type VoucherStatus = 'active' | 'inactive' | 'expired';

export function getVoucherStatus(voucher: {
  isActive: boolean;
  expiresAt: string | Date | null;
}): VoucherStatus {
  if (voucher.expiresAt && new Date(voucher.expiresAt) < new Date()) {
    return 'expired';
  }
  return voucher.isActive ? 'active' : 'inactive';
}

const statusConfig: Record<
  VoucherStatus,
  { label: string; variant: 'success' | 'secondary' | 'destructive' }
> = {
  active: { label: 'Kích hoạt', variant: 'success' },
  inactive: { label: 'Tắt', variant: 'secondary' },
  expired: { label: 'Hết hạn', variant: 'destructive' },
};

interface VoucherStatusBadgeProps {
  isActive: boolean;
  expiresAt: string | Date | null;
}

export function VoucherStatusBadge({
  isActive,
  expiresAt,
}: VoucherStatusBadgeProps) {
  const status = getVoucherStatus({ isActive, expiresAt });
  const { label, variant } = statusConfig[status];
  return <Badge variant={variant}>{label}</Badge>;
}
