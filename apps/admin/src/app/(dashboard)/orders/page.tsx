import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { adminFetch } from '@/lib/admin-api-client';
import { toList } from '@/lib/admin-data';
import { formatCurrency, formatDateShort } from '@/lib/utils';
import type { Order } from '@longnhan/types';

interface OrdersPageProps {
  searchParams: Promise<{
    orderStatus?: string;
    paymentStatus?: string;
  }>;
}

const orderStatuses = ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'];
const paymentStatuses = ['pending', 'paid', 'failed'];

function buildQuery(params: { orderStatus?: string; paymentStatus?: string }) {
  const query = new URLSearchParams({ page: '1', limit: '30' });
  if (params.orderStatus) query.set('orderStatus', params.orderStatus);
  if (params.paymentStatus) query.set('paymentStatus', params.paymentStatus);
  return query.toString();
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const params = await searchParams;
  const query = buildQuery(params);
  const rawOrders = await adminFetch<unknown>(`/orders?${query}`).catch(() => []);
  const orders = toList<Order>(rawOrders);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header title="Đơn hàng" />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bộ lọc</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <label className="text-sm text-gray-600" htmlFor="orderStatus">Trạng thái đơn</label>
                <select
                  id="orderStatus"
                  name="orderStatus"
                  defaultValue={params.orderStatus || ''}
                  className="h-10 w-full rounded-md border border-gray-200 px-3 text-sm"
                >
                  <option value="">Tất cả</option>
                  {orderStatuses.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-600" htmlFor="paymentStatus">Thanh toán</label>
                <select
                  id="paymentStatus"
                  name="paymentStatus"
                  defaultValue={params.paymentStatus || ''}
                  className="h-10 w-full rounded-md border border-gray-200 px-3 text-sm"
                >
                  <option value="">Tất cả</option>
                  {paymentStatuses.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="inline-flex h-10 items-center rounded-md bg-green-600 px-4 text-sm font-medium text-white hover:bg-green-700"
                >
                  Lọc
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Danh sách đơn ({orders.length})</CardTitle>
          </CardHeader>
          <CardContent>
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
                    <TableCell><Badge variant="secondary">{order.orderStatus}</Badge></TableCell>
                    <TableCell><Badge variant="outline">{order.paymentStatus}</Badge></TableCell>
                    <TableCell>{formatDateShort(order.createdAt)}</TableCell>
                    <TableCell>
                      <Link href={`/orders/${order.id}`} className="text-sm text-green-700 hover:underline">
                        Xem chi tiết
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                      Không có đơn hàng phù hợp
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
