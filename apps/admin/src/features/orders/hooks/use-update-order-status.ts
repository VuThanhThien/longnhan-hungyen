'use client';

import { useMutation } from '@tanstack/react-query';
import { ordersApi } from '@/features/orders/api/orders-api';
import type { OrderStatus, PaymentStatus } from '@longnhan/types';

interface UpdateOrderStatusInput {
  orderId: string;
  orderStatus?: OrderStatus;
  paymentStatus?: PaymentStatus;
}

export function useUpdateOrderStatus() {
  return useMutation({
    mutationFn: ({
      orderId,
      orderStatus,
      paymentStatus,
    }: UpdateOrderStatusInput) =>
      ordersApi.updateStatus(orderId, { orderStatus, paymentStatus }),
  });
}
