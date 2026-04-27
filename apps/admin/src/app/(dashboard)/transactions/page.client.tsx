'use client';

import Link from 'next/link';
import { useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { Calendar as CalendarIcon, ChevronDown, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
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
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ListPagination } from '@/components/admin/list-pagination';
import { ordersApi } from '@/features/orders/api/orders-api';
import { adminQueryKeys } from '@/lib/query-keys';
import { buildAdminListQuery } from '@/lib/admin-list-query';
import { formatCurrency, formatDate } from '@/lib/utils';

type BadgeVariant = BadgeProps['variant'];

interface FilterOption {
  value: string;
  label: string;
  variant?: BadgeVariant;
}

const TRANSACTION_TYPE_OPTIONS: FilterOption[] = [
  { value: TransactionType.PAYMENT, label: 'Thanh toán', variant: 'info' },
  { value: TransactionType.REFUND, label: 'Hoàn tiền', variant: 'warning' },
  {
    value: TransactionType.ADJUSTMENT,
    label: 'Điều chỉnh',
    variant: 'secondary',
  },
  { value: TransactionType.FEE, label: 'Phí', variant: 'outline' },
];

const TRANSACTION_METHOD_OPTIONS: FilterOption[] = [
  { value: TransactionMethod.COD, label: 'COD', variant: 'secondary' },
  {
    value: TransactionMethod.BANK_TRANSFER,
    label: 'Chuyển khoản',
    variant: 'info',
  },
  { value: TransactionMethod.CASH, label: 'Tiền mặt', variant: 'outline' },
  { value: TransactionMethod.OTHER, label: 'Khác', variant: 'secondary' },
];

const TRANSACTION_STATUS_OPTIONS: FilterOption[] = [
  { value: TransactionStatus.PENDING, label: 'Chờ xử lý', variant: 'warning' },
  {
    value: TransactionStatus.COMPLETED,
    label: 'Hoàn thành',
    variant: 'success',
  },
  {
    value: TransactionStatus.FAILED,
    label: 'Thất bại',
    variant: 'destructive',
  },
  { value: TransactionStatus.VOIDED, label: 'Đã hủy', variant: 'secondary' },
];

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

type TransactionsFilterValues = {
  type: string;
  method: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  q: string;
};

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

export function TransactionsListClient() {
  const router = useRouter();
  const sp = useSearchParams();

  const params = useMemo(
    () => ({
      type: sp?.get('type') ?? '',
      method: sp?.get('method') ?? '',
      status: sp?.get('status') ?? '',
      dateFrom: sp?.get('dateFrom') ?? '',
      dateTo: sp?.get('dateTo') ?? '',
      q: sp?.get('q') ?? '',
      page: sp?.get('page') ?? '1',
    }),
    [sp],
  );

  const query = useMemo(
    () =>
      buildAdminListQuery(
        {
          type: params.type || undefined,
          method: params.method || undefined,
          status: params.status || undefined,
          dateFrom: params.dateFrom
            ? `${params.dateFrom}T00:00:00.000Z`
            : undefined,
          dateTo: params.dateTo ? `${params.dateTo}T23:59:59.999Z` : undefined,
          q: params.q || undefined,
          page: params.page,
        },
        { limit: PAGE_LIMIT },
      ),
    [
      params.type,
      params.method,
      params.status,
      params.dateFrom,
      params.dateTo,
      params.q,
      params.page,
    ],
  );

  const { data, isLoading, isError } = useQuery<ListResponse>({
    queryKey: adminQueryKeys.transactions.list(query),
    queryFn: () => ordersApi.listTransactions(query),
  });

  const filterForm = useForm<TransactionsFilterValues>({
    defaultValues: {
      type: params.type,
      method: params.method,
      status: params.status,
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
      q: params.q,
    },
  });

  useEffect(() => {
    filterForm.reset({
      type: params.type,
      method: params.method,
      status: params.status,
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
      q: params.q,
    });
  }, [params, filterForm]);

  const hasActiveFilters =
    Boolean(params.type) ||
    Boolean(params.method) ||
    Boolean(params.status) ||
    Boolean(params.dateFrom) ||
    Boolean(params.dateTo) ||
    Boolean(params.q);

  function applyFilters(values: TransactionsFilterValues) {
    const next = new URLSearchParams();
    if (values.type) next.set('type', values.type);
    if (values.method) next.set('method', values.method);
    if (values.status) next.set('status', values.status);
    if (values.dateFrom) next.set('dateFrom', values.dateFrom);
    if (values.dateTo) next.set('dateTo', values.dateTo);
    if (values.q) next.set('q', values.q);
    next.set('page', '1');
    const qs = next.toString();
    router.push(qs ? `/transactions?${qs}` : '/transactions');
  }

  function clearFilters() {
    filterForm.reset({
      type: '',
      method: '',
      status: '',
      dateFrom: '',
      dateTo: '',
      q: '',
    });
    router.push('/transactions');
  }

  const rows = data?.data ?? [];
  const pag = data?.pagination;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <Form {...filterForm}>
            <form
              className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
              onSubmit={filterForm.handleSubmit(applyFilters)}
            >
              <FormField
                control={filterForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại</FormLabel>
                    <FormControl>
                      <BadgeFilterSelect
                        value={field.value}
                        options={TRANSACTION_TYPE_OPTIONS}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={filterForm.control}
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phương thức</FormLabel>
                    <FormControl>
                      <BadgeFilterSelect
                        value={field.value}
                        options={TRANSACTION_METHOD_OPTIONS}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={filterForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trạng thái</FormLabel>
                    <FormControl>
                      <BadgeFilterSelect
                        value={field.value}
                        options={TRANSACTION_STATUS_OPTIONS}
                        onChange={field.onChange}
                      />
                    </FormControl>
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
              <FormField
                control={filterForm.control}
                name="q"
                render={({ field }) => (
                  <FormItem className="min-w-0 lg:col-span-2">
                    <FormLabel>Tìm (mã đơn / ref)</FormLabel>
                    <FormControl>
                      <Input placeholder="LN-… hoặc mã tham chiếu" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem className="md:col-span-2 lg:col-span-1">
                <FormLabel className="invisible">Submit</FormLabel>
                <div className="flex items-end gap-2">
                  {hasActiveFilters ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={clearFilters}
                    >
                      Đặt lại
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
                      <TableCell>
                        {(() => {
                          const opt = TRANSACTION_TYPE_OPTIONS.find(
                            (o) => o.value === tx.type,
                          );
                          return opt ? (
                            <Badge variant={opt.variant}>{opt.label}</Badge>
                          ) : (
                            <Badge variant="outline">{tx.type}</Badge>
                          );
                        })()}
                      </TableCell>
                      <TableCell>
                        {tx.method
                          ? (() => {
                              const opt = TRANSACTION_METHOD_OPTIONS.find(
                                (o) => o.value === tx.method,
                              );
                              return opt ? (
                                <Badge variant={opt.variant}>{opt.label}</Badge>
                              ) : (
                                <Badge variant="outline">{tx.method}</Badge>
                              );
                            })()
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            tx.direction === TransactionDirection.IN
                              ? 'success'
                              : 'secondary'
                          }
                        >
                          {tx.direction === TransactionDirection.IN
                            ? 'Vào'
                            : 'Ra'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {tx.direction === TransactionDirection.OUT ? '-' : ''}
                        {formatCurrency(tx.amount)}
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const opt = TRANSACTION_STATUS_OPTIONS.find(
                            (o) => o.value === tx.status,
                          );
                          return opt ? (
                            <Badge variant={opt.variant}>{opt.label}</Badge>
                          ) : (
                            <Badge variant="outline">{tx.status}</Badge>
                          );
                        })()}
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
            type: params.type || undefined,
            method: params.method || undefined,
            status: params.status || undefined,
            dateFrom: params.dateFrom || undefined,
            dateTo: params.dateTo || undefined,
            q: params.q || undefined,
          }}
          limit={PAGE_LIMIT}
        />
      ) : null}
    </div>
  );
}

function BadgeFilterSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: FilterOption[];
  onChange: (v: string) => void;
}) {
  const selected = options.find((o) => o.value === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex h-10 w-full items-center justify-between rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          {selected ? (
            <Badge variant={selected.variant}>{selected.label}</Badge>
          ) : (
            <span className="text-muted-foreground">Tất cả</span>
          )}
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-48">
        <DropdownMenuItem onSelect={() => onChange('')}>
          <span className="text-muted-foreground">Tất cả</span>
        </DropdownMenuItem>
        {options.map((o) => (
          <DropdownMenuItem key={o.value} onSelect={() => onChange(o.value)}>
            <Badge variant={o.variant}>{o.label}</Badge>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
