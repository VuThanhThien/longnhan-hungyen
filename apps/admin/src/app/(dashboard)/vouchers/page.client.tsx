'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { ListPagination } from '@/components/admin/list-pagination';
import { VoucherStatusBadge } from '@/components/vouchers/voucher-status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { buildAdminListQuery } from '@/lib/admin-list-query';
import { toPaginated } from '@/lib/admin-data';
import { adminQueryKeys } from '@/lib/query-keys';
import { formatCurrency, formatDateShort } from '@/lib/utils';
import {
  adminClientGet,
  adminClientPatch,
  adminClientDelete,
} from '@/lib/admin-client';
import { extractErrorMessage } from '@/lib/http/extract-error-message';

const PAGE_LIMIT = 30;

type Voucher = {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number | null;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
};

export default function VouchersPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const q = searchParams.get('q') || '';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);

  const query = useMemo(
    () =>
      buildAdminListQuery(
        { q: q || undefined, page: String(page) },
        { limit: PAGE_LIMIT, defaultPage: 1 },
      ),
    [q, page],
  );

  const {
    data: raw,
    isLoading,
    isError,
  } = useQuery({
    queryKey: adminQueryKeys.vouchers.list(query),
    queryFn: () => adminClientGet<unknown>(`/vouchers?${query}`),
  });

  const { data: vouchers, pagination } = toPaginated<Voucher>(raw ?? null);

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminClientPatch<Voucher>(`/vouchers/${id}`, { isActive }),
    onSuccess: async () => {
      toast.success('Đã cập nhật trạng thái');
      await queryClient.invalidateQueries({
        queryKey: adminQueryKeys.vouchers.all,
      });
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminClientDelete(`/vouchers/${id}`),
    onSuccess: async () => {
      toast.success('Đã xóa mã giảm giá');
      await queryClient.invalidateQueries({
        queryKey: adminQueryKeys.vouchers.all,
      });
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const val = (fd.get('q') as string) ?? '';
    const sp = new URLSearchParams();
    if (val) sp.set('q', val);
    router.push(sp.toString() ? `/vouchers?${sp}` : '/vouchers');
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header title="Mã giảm giá" />
      <main className="flex flex-1 flex-col space-y-6 overflow-y-auto p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              name="q"
              defaultValue={q}
              placeholder="Tìm mã…"
              className="w-52"
            />
            <Button type="submit" variant="outline">
              Tìm
            </Button>
          </form>
          <Button asChild>
            <Link href="/vouchers/new">
              <Plus className="mr-1.5 h-4 w-4" />
              Tạo mã giảm giá
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Danh sách mã giảm giá</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 text-sm text-muted-foreground">
                Đang tải…
              </div>
            ) : null}
            {isError ? (
              <div className="py-8 text-sm text-destructive">
                Tải dữ liệu thất bại
              </div>
            ) : null}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Giá trị</TableHead>
                  <TableHead>Đơn tối thiểu</TableHead>
                  <TableHead>Đã dùng / Tối đa</TableHead>
                  <TableHead>Hết hạn</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="w-[1%] whitespace-nowrap text-right">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vouchers.map((v) => {
                  const isUsed = v.usedCount > 0;
                  const isToggling =
                    toggleMutation.isPending &&
                    toggleMutation.variables?.id === v.id;
                  const isDeleting =
                    deleteMutation.isPending &&
                    deleteMutation.variables === v.id;

                  return (
                    <TableRow key={v.id}>
                      <TableCell className="font-mono font-semibold">
                        {v.code}
                      </TableCell>
                      <TableCell>
                        {v.discountType === 'percentage'
                          ? 'Phần trăm'
                          : 'Số tiền'}
                      </TableCell>
                      <TableCell>
                        {v.discountType === 'percentage'
                          ? `${v.discountValue}%`
                          : formatCurrency(v.discountValue)}
                      </TableCell>
                      <TableCell>
                        {v.minOrderAmount != null
                          ? formatCurrency(v.minOrderAmount)
                          : '—'}
                      </TableCell>
                      <TableCell>
                        {v.usedCount} / {v.maxUses ?? '∞'}
                      </TableCell>
                      <TableCell>
                        {v.expiresAt ? formatDateShort(v.expiresAt) : '—'}
                      </TableCell>
                      <TableCell>
                        <VoucherStatusBadge
                          isActive={v.isActive}
                          expiresAt={v.expiresAt}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/vouchers/${v.id}`}>Chi tiết</Link>
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={isToggling || toggleMutation.isPending}
                            onClick={() =>
                              toggleMutation.mutate({
                                id: v.id,
                                isActive: !v.isActive,
                              })
                            }
                          >
                            {isToggling ? (
                              <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                            ) : null}
                            {v.isActive ? 'Tắt' : 'Bật'}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            disabled={
                              isUsed || isDeleting || deleteMutation.isPending
                            }
                            title={
                              isUsed
                                ? 'Voucher đã được sử dụng'
                                : 'Xóa mã giảm giá'
                            }
                            onClick={() => {
                              if (
                                !window.confirm(
                                  'Xóa mã giảm giá này? Hành động không hoàn tác.',
                                )
                              )
                                return;
                              deleteMutation.mutate(v.id);
                            }}
                          >
                            {isDeleting ? (
                              <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                            ) : null}
                            Xóa
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {vouchers.length === 0 && !isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-8 text-center text-muted-foreground"
                    >
                      Không có mã giảm giá nào
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
            <ListPagination
              basePath="/vouchers"
              pagination={{
                currentPage: pagination.currentPage,
                totalPages: pagination.totalPages,
                totalRecords: pagination.totalRecords,
              }}
              filters={{ q: q || undefined }}
              limit={PAGE_LIMIT}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
