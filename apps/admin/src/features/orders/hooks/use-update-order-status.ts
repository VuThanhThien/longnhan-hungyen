'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@/features/orders/api/orders-api';
import { adminQueryKeys } from '@/lib/query-keys';
import type { OrderStatus, PaymentStatus } from '@longnhan/types';

interface UpdateOrderStatusInput {
  orderId: string;
  orderStatus?: OrderStatus;
  paymentStatus?: PaymentStatus;
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      orderStatus,
      paymentStatus,
    }: UpdateOrderStatusInput) =>
      ordersApi.updateStatus(orderId, { orderStatus, paymentStatus }),
    onSuccess: (_data, { orderId }) => {
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.orders.detail(orderId),
      });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.orders.all });
    },
  });
}
