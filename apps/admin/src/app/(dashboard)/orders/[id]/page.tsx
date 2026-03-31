import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { adminFetch } from '@/lib/admin-api-client';
import { formatCurrency, formatDate } from '@/lib/utils';
import { OrderStatusPanel } from '@/components/orders/order-status-panel';
import type { Order } from '@longnhan/types';

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const order = await adminFetch<Order>(`/orders/${id}`).catch(() => null);

  if (!order) notFound();

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header title={`Đơn hàng ${order.code}`} />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Thông tin khách hàng</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2 text-sm">
            <p><span className="text-gray-500">Tên:</span> {order.customerName}</p>
            <p><span className="text-gray-500">SĐT:</span> {order.phone}</p>
            <p><span className="text-gray-500">Email:</span> {order.email || '-'}</p>
            <p><span className="text-gray-500">Phương thức:</span> {order.paymentMethod}</p>
            <p className="md:col-span-2"><span className="text-gray-500">Địa chỉ:</span> {order.address}</p>
            <p><span className="text-gray-500">Ngày tạo:</span> {formatDate(order.createdAt)}</p>
            <p><span className="text-gray-500">Tổng tiền:</span> {formatCurrency(order.total)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cập nhật trạng thái</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderStatusPanel
              orderId={order.id}
              initialOrderStatus={order.orderStatus}
              initialPaymentStatus={order.paymentStatus}
            />
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
                  <TableHead>Biến thể</TableHead>
                  <TableHead>SL</TableHead>
                  <TableHead>Đơn giá</TableHead>
                  <TableHead>Thành tiền</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{String(item.variantSnapshot?.['label'] || '-')}</TableCell>
                    <TableCell>{item.qty}</TableCell>
                    <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                    <TableCell>{formatCurrency(item.subtotal)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
