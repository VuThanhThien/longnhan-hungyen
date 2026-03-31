import { httpClient } from '@/lib/http-client';
import type { OrderStatus, PaymentStatus } from '@longnhan/types';

interface UpdateOrderStatusPayload {
  orderStatus?: OrderStatus;
  paymentStatus?: PaymentStatus;
}

export const ordersApi = {
  async updateStatus(orderId: string, payload: UpdateOrderStatusPayload) {
    await httpClient.patch(`/orders/${orderId}/status`, payload);
  },
};
