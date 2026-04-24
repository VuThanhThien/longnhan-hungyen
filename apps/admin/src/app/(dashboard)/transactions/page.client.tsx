'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  TransactionDirection,
  TransactionMethod,
  TransactionStatus,
  TransactionType,
  type Transaction,
} from '@longnhan/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ListPagination } from '@/components/admin/list-pagination';
import { ordersApi } from '@/features/orders/api/orders-api';
import { adminQueryKeys } from '@/lib/query-keys';
import { buildAdminListQuery } from '@/lib/admin-list-query';
import { formatCurrency, formatDate } from '@/lib/utils';

const PAGE_LIMIT = 30;

interface ListResponse {
  data: Transaction[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    limit: number;
  };
}

export function TransactionsListClient() {
  const router = useRouter();
  const sp = useSearchParams();

  const filters = {
    type: sp?.get('type') ?? '',
    method: sp?.get('method') ?? '',
    status: sp?.get('status') ?? '',
    dateFrom: sp?.get('dateFrom') ?? '',
    dateTo: sp?.get('dateTo') ?? '',
    q: sp?.get('q') ?? '',
    page: sp?.get('page') ?? '1',
  };

  const query = useMemo(
    () =>
      buildAdminListQuery(
        {
          type: filters.type || undefined,
          method: filters.method || undefined,
          status: filters.status || undefined,
          dateFrom: filters.dateFrom
            ? `${filters.dateFrom}T00:00:00.000Z`
            : undefined,
          dateTo: filters.dateTo
            ? `${filters.dateTo}T23:59:59.999Z`
            : undefined,
          q: filters.q || undefined,
          page: filters.page,
        },
        { limit: PAGE_LIMIT },
      ),
    [
      filters.type,
      filters.method,
      filters.status,
      filters.dateFrom,
      filters.dateTo,
      filters.q,
      filters.page,
    ],
  );

  const { data, isLoading, isError } = useQuery<ListResponse>({
    queryKey: adminQueryKeys.transactions.list(query),
    queryFn: () => ordersApi.listTransactions(query),
  });

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(sp?.toString() ?? '');
    if (value) params.set(key, value);
    else params.delete(key);
    // reset to page 1 on any filter change
    if (key !== 'page') params.set('page', '1');
    router.replace(`/transactions?${params.toString()}`);
  }

  function reset() {
    router.replace('/transactions');
  }

  const rows = data?.data ?? [];
  const pag = data?.pagination;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-wrap gap-3 pt-6">
          <FilterSelect
            label="Loại"
            value={filters.type}
            options={Object.values(TransactionType)}
            onChange={(v) => updateParam('type', v)}
          />
          <FilterSelect
            label="Phương thức"
            value={filters.method}
            options={Object.values(TransactionMethod)}
            onChange={(v) => updateParam('method', v)}
          />
          <FilterSelect
            label="Trạng thái"
            value={filters.status}
            options={Object.values(TransactionStatus)}
            onChange={(v) => updateParam('status', v)}
          />
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Từ ngày</label>
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => updateParam('dateFrom', e.target.value)}
              className="w-40"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Đến ngày</label>
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) => updateParam('dateTo', e.target.value)}
              className="w-40"
            />
          </div>
          <div className="flex-1 min-w-[200px] space-y-1">
            <label className="text-xs text-muted-foreground">
              Tìm (mã đơn / ref)
            </label>
            <Input
              value={filters.q}
              onChange={(e) => updateParam('q', e.target.value)}
              placeholder="LN-… hoặc mã tham chiếu"
            />
          </div>
          <div className="flex items-end">
            <Button variant="outline" size="sm" onClick={reset}>
              Đặt lại
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Thời điểm</TableHead>
                <TableHead>Đơn hàng</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Phương thức</TableHead>
                <TableHead>Hướng</TableHead>
                <TableHead className="text-right">Số tiền</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Tham chiếu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-sm text-muted-foreground"
                  >
                    Đang tải…
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-sm text-destructive"
                  >
                    Lỗi tải danh sách
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-sm text-muted-foreground"
                  >
                    Không có giao dịch
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((tx) => {
                  const ext = tx as Transaction & { orderCode?: string };
                  return (
                    <TableRow key={tx.id}>
                      <TableCell>{formatDate(tx.occurredAt)}</TableCell>
                      <TableCell>
                        <Link
                          href={`/orders/${tx.orderId}`}
                          className="text-accent hover:underline"
                        >
                          {ext.orderCode ?? tx.orderId.slice(0, 8)}
                        </Link>
                      </TableCell>
                      <TableCell>{tx.type}</TableCell>
                      <TableCell>{tx.method ?? '-'}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            tx.direction === TransactionDirection.IN
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {tx.direction}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {tx.direction === TransactionDirection.OUT ? '-' : ''}
                        {formatCurrency(tx.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge>{tx.status}</Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        {tx.referenceNo ?? '-'}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {pag ? (
        <ListPagination
          basePath="/transactions"
          pagination={pag}
          filters={{
            type: filters.type || undefined,
            method: filters.method || undefined,
            status: filters.status || undefined,
            dateFrom: filters.dateFrom || undefined,
            dateTo: filters.dateTo || undefined,
            q: filters.q || undefined,
          }}
          limit={PAGE_LIMIT}
        />
      ) : null}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-muted-foreground">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-40 rounded-md border border-border px-3 text-sm"
      >
        <option value="">Tất cả</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
