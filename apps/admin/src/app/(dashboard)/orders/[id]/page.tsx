'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  TransactionDirection,
  TransactionStatus,
  type Order,
} from '@longnhan/types';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency, formatDate } from '@/lib/utils';
import { OrderStatusPanel } from '@/components/orders/order-status-panel';
import { OrderStatusTimeline } from '@/components/orders/order-status-timeline';
import { OrderTransactionsTable } from '@/components/orders/order-transactions-table';
import { OrderMoneySummary } from '@/components/orders/order-money-summary';
import { RefundSuggestionDialog } from '@/components/orders/refund-suggestion-dialog';
import { adminClientGet } from '@/lib/admin-client';
import { ordersApi } from '@/features/orders/api/orders-api';
import { adminQueryKeys } from '@/lib/query-keys';

function orderItemSnapshot(item: Order['items'][number]): Partial<{
  productId: string;
  label: string;
  skuCode: string;
}> {
  const snap = item.variantSnapshot as Record<string, unknown> | undefined;
  return {
    productId: typeof snap?.productId === 'string' ? snap.productId : undefined,
    label: typeof snap?.label === 'string' ? snap.label : undefined,
    skuCode: typeof snap?.skuCode === 'string' ? snap.skuCode : undefined,
  };
}

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [refundOpen, setRefundOpen] = useState(false);
  const [refundAmount, setRefundAmount] = useState(0);

  const {
    data: order,
    isLoading,
    isError,
  } = useQuery({
    queryKey: adminQueryKeys.orders.detail(id ?? ''),
    enabled: Boolean(id),
    queryFn: () => adminClientGet<Order>(`/orders/${id}`),
  });

  const productIds = useMemo(() => {
    const set = new Set<string>();
    for (const item of order?.items ?? []) {
      const snap = orderItemSnapshot(item);
      if (snap.productId) set.add(snap.productId);
    }
    return Array.from(set);
  }, [order]);

  const productIdsKey = productIds.join(',');

  const { data: productsBrief = [] } = useQuery({
    queryKey: adminQueryKeys.products.brief(productIdsKey),
    enabled: productIds.length > 0,
    queryFn: () =>
      adminClientGet<Array<{ id: string; name: string }>>(
        `/products/admin/brief?ids=${encodeURIComponent(productIdsKey)}`,
      ),
  });

  const productNameById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const p of productsBrief) map[p.id] = p.name;
    return map;
  }, [productsBrief]);

  const { data: history = [] } = useQuery({
    queryKey: adminQueryKeys.orders.statusHistory(id ?? ''),
    enabled: Boolean(id),
    queryFn: () => ordersApi.getStatusHistory(id!),
  });

  const { data: transactions = [] } = useQuery({
    queryKey: adminQueryKeys.orders.transactions(id ?? ''),
    enabled: Boolean(id),
    queryFn: () => ordersApi.getTransactions(id!),
  });

  const paid = useMemo(
    () =>
      transactions
        .filter((t) => t.status === TransactionStatus.COMPLETED)
        .reduce(
          (acc, t) =>
            acc +
            (t.direction === TransactionDirection.IN ? t.amount : -t.amount),
          0,
        ),
    [transactions],
  );

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header title={order ? `Đơn hàng ${order.code}` : 'Đơn hàng'} />
      <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Đang tải…</div>
        ) : null}
        {isError ? (
          <div className="text-sm text-destructive">
            Không tìm thấy đơn hàng
          </div>
        ) : null}
        {!order ? null : (
          <>
            <OrderMoneySummary total={order.total} paid={paid} />

            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Thông tin khách hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2 text-sm">
                <p>
                  <span className="text-muted-foreground">Tên:</span>{' '}
                  {order.customerName}
                </p>
                <p>
                  <span className="text-muted-foreground">SĐT:</span>{' '}
                  {order.phone}
                </p>
                <p>
                  <span className="text-muted-foreground">Email:</span>{' '}
                  {order.email || '-'}
                </p>
                <p>
                  <span className="text-muted-foreground">Phương thức:</span>{' '}
                  {order.paymentMethod}
                </p>
                <p className="md:col-span-2">
                  <span className="text-muted-foreground">Địa chỉ:</span>{' '}
                  {order.address}
                </p>
                <p>
                  <span className="text-muted-foreground">Ngày tạo:</span>{' '}
                  {formatDate(order.createdAt)}
                </p>
                <p>
                  <span className="text-muted-foreground">Tổng tiền:</span>{' '}
                  {formatCurrency(order.total)}
                </p>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Cập nhật trạng thái
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <OrderStatusPanel
                    orderId={order.id}
                    initialOrderStatus={order.orderStatus}
                    initialPaymentStatus={order.paymentStatus}
                    onSuggestRefund={(amount) => {
                      setRefundAmount(amount);
                      setRefundOpen(true);
                    }}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Lịch sử trạng thái
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <OrderStatusTimeline history={history} />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Giao dịch</CardTitle>
              </CardHeader>
              <CardContent>
                <OrderTransactionsTable orderId={order.id} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sản phẩm trong đơn</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sản phẩm</TableHead>
                      <TableHead>Biến thể</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>SL</TableHead>
                      <TableHead>Đơn giá</TableHead>
                      <TableHead>Thành tiền</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.items.map((item) =>
                      (() => {
                        const snap = orderItemSnapshot(item);
                        const productName = snap.productId
                          ? productNameById[snap.productId]
                          : undefined;
                        return (
                          <TableRow key={item.id}>
                            <TableCell>{productName ?? 'Sản phẩm'}</TableCell>
                            <TableCell>{snap.label ?? '-'}</TableCell>
                            <TableCell className="whitespace-nowrap">
                              {snap.skuCode ?? '-'}
                            </TableCell>
                            <TableCell>{item.qty}</TableCell>
                            <TableCell>
                              {formatCurrency(item.unitPrice)}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(item.subtotal)}
                            </TableCell>
                          </TableRow>
                        );
                      })(),
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <RefundSuggestionDialog
              orderId={order.id}
              open={refundOpen}
              onOpenChange={setRefundOpen}
              suggestedAmount={refundAmount}
              orderPaymentMethod={order.paymentMethod}
            />
          </>
        )}
      </main>
    </div>
  );
}
