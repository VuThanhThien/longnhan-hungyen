'use client';

import { useState } from 'react';
import { OrderStatus, PaymentStatus } from '@longnhan/types';
import { toast } from '@/hooks/use-toast';
import { useUpdateOrderStatus } from '@/features/orders/hooks/use-update-order-status';

interface OrderStatusPanelProps {
  orderId: string;
  initialOrderStatus: OrderStatus;
  initialPaymentStatus: PaymentStatus;
}

const orderStatusLabels: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'Chờ xác nhận',
  [OrderStatus.CONFIRMED]: 'Đã xác nhận',
  [OrderStatus.SHIPPING]: 'Đang giao',
  [OrderStatus.DELIVERED]: 'Đã giao',
  [OrderStatus.CANCELLED]: 'Đã hủy',
};

const orderStatuses: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.SHIPPING,
  OrderStatus.DELIVERED,
  OrderStatus.CANCELLED,
];

const paymentStatusLabels: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: 'Chờ thanh toán',
  [PaymentStatus.PAID]: 'Đã thanh toán',
  [PaymentStatus.FAILED]: 'Thất bại',
};
const paymentStatuses: PaymentStatus[] = [
  PaymentStatus.PENDING,
  PaymentStatus.PAID,
  PaymentStatus.FAILED,
];

export function OrderStatusPanel({
  orderId,
  initialOrderStatus,
  initialPaymentStatus,
}: OrderStatusPanelProps) {
  const [orderStatus, setOrderStatus] = useState(initialOrderStatus);
  const [paymentStatus, setPaymentStatus] = useState(initialPaymentStatus);
  const updateStatusMutation = useUpdateOrderStatus();

  async function updateStatus(next: {
    orderStatus?: OrderStatus;
    paymentStatus?: PaymentStatus;
  }) {
    try {
      await updateStatusMutation.mutateAsync({
        orderId,
        orderStatus: next.orderStatus,
        paymentStatus: next.paymentStatus,
      });
      if (next.orderStatus) setOrderStatus(next.orderStatus);
      if (next.paymentStatus) setPaymentStatus(next.paymentStatus);

      toast({ title: 'Cập nhật trạng thái thành công' });
    } catch {
      toast({ title: 'Cập nhật trạng thái thất bại', variant: 'destructive' });
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="space-y-1">
        <label htmlFor="orderStatus" className="text-sm text-muted-foreground">
          Trạng thái đơn
        </label>
        <select
          id="orderStatus"
          value={orderStatus}
          onChange={(event) =>
            updateStatus({ orderStatus: event.target.value as OrderStatus })
          }
          disabled={updateStatusMutation.isPending}
          className="h-10 w-full rounded-md border border-border px-3 text-sm"
        >
          {orderStatuses.map((status) => (
            <option key={status} value={status}>
              {orderStatusLabels[status]}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <label
          htmlFor="paymentStatus"
          className="text-sm text-muted-foreground"
        >
          Trạng thái thanh toán
        </label>
        <select
          id="paymentStatus"
          value={paymentStatus}
          onChange={(event) =>
            updateStatus({ paymentStatus: event.target.value as PaymentStatus })
          }
          disabled={updateStatusMutation.isPending}
          className="h-10 w-full rounded-md border border-border px-3 text-sm"
        >
          {paymentStatuses.map((status) => (
            <option key={status} value={status}>
              {paymentStatusLabels[status]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
