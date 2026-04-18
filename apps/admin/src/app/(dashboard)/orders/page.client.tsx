'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout/header';
import { ListPagination } from '@/components/admin/list-pagination';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { formatCurrency, formatDateShort } from '@/lib/utils';
import { adminClientGet } from '@/lib/admin-client';
import type { Order } from '@longnhan/types';

const PAGE_LIMIT = 30;

const orderStatuses = [
  'pending',
  'confirmed',
  'shipping',
  'delivered',
  'cancelled',
];
const paymentStatuses = ['pending', 'paid', 'failed'];

/** URL stores YYYY-MM-DD; API expects ISO date strings */
function toIsoStartDay(d: string | undefined): string | undefined {
  if (!d || !/^\d{4}-\d{2}-\d{2}$/.test(d)) return undefined;
  return `${d}T00:00:00.000Z`;
}

function toIsoEndDay(d: string | undefined): string | undefined {
  if (!d || !/^\d{4}-\d{2}-\d{2}$/.test(d)) return undefined;
  return `${d}T23:59:59.999Z`;
}

export default function OrdersPageClient() {
  const searchParams = useSearchParams();
  const params = useMemo(
    () => ({
      orderStatus: searchParams.get('orderStatus') || undefined,
      paymentStatus: searchParams.get('paymentStatus') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      page: searchParams.get('page') || undefined,
    }),
    [searchParams],
  );

  const page = Math.max(1, parseInt(params.page || '1', 10) || 1);

  const query = buildAdminListQuery(
    {
      orderStatus: params.orderStatus,
      paymentStatus: params.paymentStatus,
      dateFrom: toIsoStartDay(params.dateFrom),
      dateTo: toIsoEndDay(params.dateTo),
      page: String(page),
    },
    { limit: PAGE_LIMIT, defaultPage: 1 },
  );

  const {
    data: raw,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['orders', query],
    queryFn: () => adminClientGet<unknown>(`/orders?${query}`),
  });

  const { data: orders, pagination } = toPaginated<Order>(raw ?? null);

  const filterFields = {
    orderStatus: params.orderStatus,
    paymentStatus: params.paymentStatus,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header title="Đơn hàng" />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bộ lọc</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6"
              method="get"
              action="/orders"
            >
              <div className="space-y-1">
                <label
                  className="text-sm text-muted-foreground"
                  htmlFor="orderStatus"
                >
                  Trạng thái đơn
                </label>
                <select
                  id="orderStatus"
                  name="orderStatus"
                  defaultValue={params.orderStatus || ''}
                  className="h-10 w-full rounded-md border border-border px-3 text-sm"
                >
                  <option value="">Tất cả</option>
                  {orderStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label
                  className="text-sm text-muted-foreground"
                  htmlFor="paymentStatus"
                >
                  Thanh toán
                </label>
                <select
                  id="paymentStatus"
                  name="paymentStatus"
                  defaultValue={params.paymentStatus || ''}
                  className="h-10 w-full rounded-md border border-border px-3 text-sm"
                >
                  <option value="">Tất cả</option>
                  {paymentStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label
                  className="text-sm text-muted-foreground"
                  htmlFor="dateFrom"
                >
                  Từ ngày
                </label>
                <input
                  id="dateFrom"
                  name="dateFrom"
                  type="date"
                  defaultValue={params.dateFrom || ''}
                  className="h-10 w-full rounded-md border border-border px-3 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label
                  className="text-sm text-muted-foreground"
                  htmlFor="dateTo"
                >
                  Đến ngày
                </label>
                <input
                  id="dateTo"
                  name="dateTo"
                  type="date"
                  defaultValue={params.dateTo || ''}
                  className="h-10 w-full rounded-md border border-border px-3 text-sm"
                />
              </div>
              <div className="flex items-end lg:col-span-2">
                <button
                  type="submit"
                  className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors duration-150 hover:text-destructive"
                >
                  Lọc
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Danh sách đơn</CardTitle>
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
                  <TableHead>Mã đơn</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Tổng tiền</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thanh toán</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.code}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>{formatCurrency(order.total)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{order.orderStatus}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{order.paymentStatus}</Badge>
                    </TableCell>
                    <TableCell>{formatDateShort(order.createdAt)}</TableCell>
                    <TableCell>
                      <Link
                        href={`/orders/${order.id}`}
                        className="text-sm text-success hover:underline"
                      >
                        Xem chi tiết
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-8 text-center text-muted-foreground"
                    >
                      Không có đơn hàng phù hợp
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
            <ListPagination
              basePath="/orders"
              pagination={{
                currentPage: pagination.currentPage,
                totalPages: pagination.totalPages,
                totalRecords: pagination.totalRecords,
              }}
              filters={filterFields}
              limit={PAGE_LIMIT}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
