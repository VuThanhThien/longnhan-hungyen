'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { Loader2, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/layout/header';
import { VoucherStatusBadge } from '@/components/vouchers/voucher-status-badge';
import { VoucherUsageTable } from '@/components/vouchers/voucher-usage-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { adminClientGet, adminClientPatch } from '@/lib/admin-client';
import { adminQueryKeys } from '@/lib/query-keys';
import { formatCurrency, formatDate } from '@/lib/utils';
import { extractErrorMessage } from '@/lib/http/extract-error-message';

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
  createdAt: string;
  updatedAt: string;
};

export default function VoucherDetailPageClient() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const usagePage = Math.max(
    1,
    parseInt(searchParams.get('usagePage') || '1', 10) || 1,
  );

  const {
    data: voucher,
    isLoading,
    isError,
  } = useQuery({
    queryKey: adminQueryKeys.vouchers.detail(id),
    queryFn: () => adminClientGet<Voucher>(`/vouchers/${id}`),
    enabled: Boolean(id),
  });

  const toggleMutation = useMutation({
    mutationFn: (isActive: boolean) =>
      adminClientPatch<Voucher>(`/vouchers/${id}`, { isActive }),
    onSuccess: async () => {
      toast.success('Đã cập nhật trạng thái');
      await queryClient.invalidateQueries({
        queryKey: adminQueryKeys.vouchers.detail(id),
      });
      await queryClient.invalidateQueries({
        queryKey: adminQueryKeys.vouchers.all,
      });
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header title={voucher ? `Mã: ${voucher.code}` : 'Mã giảm giá'} />
      <main className="flex-1 space-y-6 overflow-y-auto p-6">
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Đang tải…</div>
        ) : null}
        {isError ? (
          <div className="text-sm text-destructive">
            Không tìm thấy mã giảm giá
          </div>
        ) : null}

        {voucher ? (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">
                  Thông tin mã giảm giá
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={toggleMutation.isPending}
                    onClick={() => toggleMutation.mutate(!voucher.isActive)}
                  >
                    {toggleMutation.isPending ? (
                      <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                    ) : null}
                    {voucher.isActive ? 'Tắt kích hoạt' : 'Kích hoạt'}
                  </Button>
                  <Button asChild size="sm">
                    <Link href={`/vouchers/${id}/edit`}>
                      <Pencil className="mr-1.5 h-3.5 w-3.5" />
                      Chỉnh sửa
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                <p>
                  <span className="text-muted-foreground">Mã:</span>{' '}
                  <span className="font-mono font-semibold">
                    {voucher.code}
                  </span>
                </p>
                <p>
                  <span className="text-muted-foreground">Trạng thái:</span>{' '}
                  <VoucherStatusBadge
                    isActive={voucher.isActive}
                    expiresAt={voucher.expiresAt}
                  />
                </p>
                <p>
                  <span className="text-muted-foreground">Loại giảm giá:</span>{' '}
                  {voucher.discountType === 'percentage'
                    ? 'Phần trăm'
                    : 'Số tiền'}
                </p>
                <p>
                  <span className="text-muted-foreground">Giá trị giảm:</span>{' '}
                  {voucher.discountType === 'percentage'
                    ? `${voucher.discountValue}%`
                    : formatCurrency(voucher.discountValue)}
                </p>
                <p>
                  <span className="text-muted-foreground">
                    Đơn hàng tối thiểu:
                  </span>{' '}
                  {voucher.minOrderAmount != null
                    ? formatCurrency(voucher.minOrderAmount)
                    : '—'}
                </p>
                <p>
                  <span className="text-muted-foreground">Số lần tối đa:</span>{' '}
                  {voucher.maxUses ?? '∞'}
                </p>
                <p>
                  <span className="text-muted-foreground">Đã sử dụng:</span>{' '}
                  {voucher.usedCount}
                </p>
                <p>
                  <span className="text-muted-foreground">Hết hạn:</span>{' '}
                  {voucher.expiresAt ? formatDate(voucher.expiresAt) : '—'}
                </p>
                {voucher.description ? (
                  <p className="md:col-span-2">
                    <span className="text-muted-foreground">Mô tả:</span>{' '}
                    {voucher.description}
                  </p>
                ) : null}
                <p>
                  <span className="text-muted-foreground">Ngày tạo:</span>{' '}
                  {formatDate(voucher.createdAt)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Lịch sử sử dụng</CardTitle>
              </CardHeader>
              <CardContent>
                <VoucherUsageTable voucherId={id} page={usagePage} />
              </CardContent>
            </Card>
          </>
        ) : null}
      </main>
    </div>
  );
}
