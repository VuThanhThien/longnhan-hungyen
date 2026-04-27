'use client';

import Link from 'next/link';
import { useEffect, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, parseISO } from 'date-fns';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { ListPagination } from '@/components/admin/list-pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  ADMIN_FILTER_ALL,
  adminOrderListFilterSchema,
  type AdminOrderListFilterValues,
} from '@/lib/validation/admin-list-filter-schemas';
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

const orderStatusLabels: Record<string, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
};

const paymentStatusLabels: Record<string, string> = {
  pending: 'Chờ thanh toán',
  paid: 'Đã thanh toán',
  failed: 'Thất bại',
};

/** URL stores YYYY-MM-DD; API expects ISO date strings */
function toIsoStartDay(d: string | undefined): string | undefined {
  if (!d || !/^\d{4}-\d{2}-\d{2}$/.test(d)) return undefined;
  return `${d}T00:00:00.000Z`;
}

function toIsoEndDay(d: string | undefined): string | undefined {
  if (!d || !/^\d{4}-\d{2}-\d{2}$/.test(d)) return undefined;
  return `${d}T23:59:59.999Z`;
}

function DatePickerField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder: string;
}) {
  const selected = value ? parseISO(value) : undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          data-empty={!value}
          className="w-full justify-start text-left font-normal data-[empty=true]:text-muted-foreground"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selected ? format(selected, 'PPP') : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(d) => onChange(d ? format(d, 'yyyy-MM-dd') : '')}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

export default function OrdersPageClient() {
  const router = useRouter();
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

  const filterForm = useForm<AdminOrderListFilterValues>({
    resolver: zodResolver(adminOrderListFilterSchema),
    defaultValues: {
      orderStatus: params.orderStatus ?? ADMIN_FILTER_ALL,
      paymentStatus: params.paymentStatus ?? ADMIN_FILTER_ALL,
      dateFrom: params.dateFrom ?? '',
      dateTo: params.dateTo ?? '',
    },
  });

  useEffect(() => {
    filterForm.reset({
      orderStatus: params.orderStatus ?? ADMIN_FILTER_ALL,
      paymentStatus: params.paymentStatus ?? ADMIN_FILTER_ALL,
      dateFrom: params.dateFrom ?? '',
      dateTo: params.dateTo ?? '',
    });
  }, [
    params.orderStatus,
    params.paymentStatus,
    params.dateFrom,
    params.dateTo,
    filterForm,
  ]);

  const {
    data: raw,
    isLoading,
    isError,
  } = useQuery({
    queryKey: adminQueryKeys.orders.list(query),
    queryFn: () => adminClientGet<unknown>(`/orders?${query}`),
  });

  const { data: orders, pagination } = toPaginated<Order>(raw ?? null);

  const filterFields = {
    orderStatus: params.orderStatus,
    paymentStatus: params.paymentStatus,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
  };

  const hasActiveFilters =
    Boolean(params.orderStatus) ||
    Boolean(params.paymentStatus) ||
    Boolean(params.dateFrom) ||
    Boolean(params.dateTo);

  function applyFilters(values: AdminOrderListFilterValues) {
    const next = new URLSearchParams();
    if (values.orderStatus && values.orderStatus !== ADMIN_FILTER_ALL) {
      next.set('orderStatus', values.orderStatus);
    }
    if (values.paymentStatus && values.paymentStatus !== ADMIN_FILTER_ALL) {
      next.set('paymentStatus', values.paymentStatus);
    }
    if (values.dateFrom) next.set('dateFrom', values.dateFrom);
    if (values.dateTo) next.set('dateTo', values.dateTo);
    const qs = next.toString();
    router.push(qs ? `/orders?${qs}` : '/orders');
  }

  function clearFilters() {
    filterForm.reset({
      orderStatus: ADMIN_FILTER_ALL,
      paymentStatus: ADMIN_FILTER_ALL,
      dateFrom: '',
      dateTo: '',
    });
    router.push('/orders');
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header title="Đơn hàng" />
      <main className="flex flex-1 flex-col space-y-6 overflow-y-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bộ lọc</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...filterForm}>
              <form
                className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6"
                onSubmit={filterForm.handleSubmit(applyFilters)}
              >
                <FormField
                  control={filterForm.control}
                  name="orderStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trạng thái đơn</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Tất cả" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={ADMIN_FILTER_ALL}>
                            Tất cả
                          </SelectItem>
                          {orderStatuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {orderStatusLabels[status] ?? status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={filterForm.control}
                  name="paymentStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thanh toán</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Tất cả" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={ADMIN_FILTER_ALL}>
                            Tất cả
                          </SelectItem>
                          {paymentStatuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {paymentStatusLabels[status] ?? status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={filterForm.control}
                  name="dateFrom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Từ ngày</FormLabel>
                      <FormControl>
                        <DatePickerField
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Chọn ngày"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={filterForm.control}
                  name="dateTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Đến ngày</FormLabel>
                      <FormControl>
                        <DatePickerField
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Chọn ngày"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormItem className="lg:col-span-2">
                  <FormLabel className="invisible">Submit</FormLabel>
                  <div className="flex items-end gap-2">
                    {hasActiveFilters ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={clearFilters}
                      >
                        Xóa lọc
                      </Button>
                    ) : null}
                    <Button
                      type="submit"
                      disabled={filterForm.formState.isSubmitting}
                    >
                      {filterForm.formState.isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Lọc
                    </Button>
                  </div>
                </FormItem>
              </form>
            </Form>
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
                  <TableHead className="w-[1%] whitespace-nowrap text-right">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.code}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>{formatCurrency(order.total)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {orderStatusLabels[order.orderStatus] ??
                          order.orderStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {paymentStatusLabels[order.paymentStatus] ??
                          order.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDateShort(order.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="cursor-pointer"
                        >
                          <Link href={`/orders/${order.id}`}>Xem chi tiết</Link>
                        </Button>
                      </div>
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
