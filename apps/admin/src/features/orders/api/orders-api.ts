import { httpClient } from '@/lib/http-client';
import type {
  CreateTransactionDto,
  OrderStatus,
  OrderStatusHistoryEntry,
  PaymentStatus,
  Transaction,
} from '@longnhan/types';

interface UpdateOrderStatusPayload {
  orderStatus?: OrderStatus;
  paymentStatus?: PaymentStatus;
}

export interface UpdateOrderStatusResult {
  suggestRefund?: { suggestedAmount: number };
}

type UpdateTransactionPayload = Partial<
  Pick<Transaction, 'status' | 'referenceNo' | 'referenceNote' | 'occurredAt'>
>;

export const ordersApi = {
  async updateStatus(
    orderId: string,
    payload: UpdateOrderStatusPayload,
  ): Promise<UpdateOrderStatusResult> {
    const res = await httpClient.patch(`/orders/${orderId}/status`, payload);
    const body = res.data?.data ?? res.data;
    return { suggestRefund: body?.suggestRefund };
  },

  async getStatusHistory(orderId: string): Promise<OrderStatusHistoryEntry[]> {
    const res = await httpClient.get(`/orders/${orderId}/status-history`);
    return (res.data?.data ?? res.data) as OrderStatusHistoryEntry[];
  },

  async getTransactions(orderId: string): Promise<Transaction[]> {
    const res = await httpClient.get(`/orders/${orderId}/transactions`);
    return (res.data?.data ?? res.data) as Transaction[];
  },

  async createTransaction(
    orderId: string,
    payload: Omit<CreateTransactionDto, 'orderId'>,
  ): Promise<Transaction> {
    const res = await httpClient.post(
      `/orders/${orderId}/transactions`,
      payload,
    );
    return (res.data?.data ?? res.data) as Transaction;
  },

  async updateTransaction(
    transactionId: string,
    payload: UpdateTransactionPayload,
  ): Promise<Transaction> {
    const res = await httpClient.patch(
      `/transactions/${transactionId}`,
      payload,
    );
    return (res.data?.data ?? res.data) as Transaction;
  },

  async listTransactions(query: string) {
    const res = await httpClient.get(
      query ? `/transactions?${query}` : '/transactions',
    );
    return res.data;
  },
};
