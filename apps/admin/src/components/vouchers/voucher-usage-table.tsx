'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { adminClientGet } from '@/lib/admin-client';
import { adminQueryKeys } from '@/lib/query-keys';
import { buildAdminListQuery } from '@/lib/admin-list-query';
import { toPaginated } from '@/lib/admin-data';
import { ListPagination } from '@/components/admin/list-pagination';
import { formatCurrency, formatDate, maskPhone } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const PAGE_LIMIT = 20;

interface VoucherUsage {
  id: string;
  orderId: string;
  phoneMasked: string;
  discountAmount: number;
  usedAt: string;
}

interface VoucherUsageTableProps {
  voucherId: string;
  page: number;
}

export function VoucherUsageTable({ voucherId, page }: VoucherUsageTableProps) {
  const query = useMemo(
    () =>
      buildAdminListQuery(
        { page: String(page) },
        { limit: PAGE_LIMIT, defaultPage: 1 },
      ),
    [page],
  );

  const { data: raw, isLoading } = useQuery({
    queryKey: adminQueryKeys.vouchers.usages(voucherId, query),
    queryFn: () =>
      adminClientGet<unknown>(`/vouchers/${voucherId}/usages?${query}`),
    enabled: Boolean(voucherId),
  });

  const { data: usages, pagination } = toPaginated<VoucherUsage>(raw ?? null);

  if (isLoading) {
    return <div className="py-6 text-sm text-muted-foreground">Đang tải…</div>;
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã đơn</TableHead>
            <TableHead>SĐT (ẩn)</TableHead>
            <TableHead>Giảm giá</TableHead>
            <TableHead>Ngày sử dụng</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {usages.map((u) => (
            <TableRow key={u.id}>
              <TableCell>
                <Link
                  href={`/orders/${u.orderId}`}
                  className="font-mono text-xs text-accent hover:underline"
                >
                  {u.orderId.slice(0, 8)}…
                </Link>
              </TableCell>
              <TableCell className="font-mono text-sm">
                {maskPhone(u.phoneMasked)}
              </TableCell>
              <TableCell>{formatCurrency(u.discountAmount)}</TableCell>
              <TableCell>{formatDate(u.usedAt)}</TableCell>
            </TableRow>
          ))}
          {usages.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="py-8 text-center text-muted-foreground"
              >
                Chưa có lượt sử dụng nào
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
      <ListPagination
        basePath="#"
        pagination={{
          currentPage: pagination.currentPage,
          totalPages: pagination.totalPages,
          totalRecords: pagination.totalRecords,
        }}
        filters={{}}
        limit={PAGE_LIMIT}
      />
    </div>
  );
}
