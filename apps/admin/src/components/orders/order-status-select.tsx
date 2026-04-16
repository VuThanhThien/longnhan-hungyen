'use client';

import { useState } from 'react';
import { OrderStatus } from '@longnhan/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { useUpdateOrderStatus } from '@/features/orders/hooks/use-update-order-status';

const orderStatusLabels: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'Chờ xác nhận',
  [OrderStatus.CONFIRMED]: 'Đã xác nhận',
  [OrderStatus.SHIPPING]: 'Đang giao',
  [OrderStatus.DELIVERED]: 'Đã giao',
  [OrderStatus.CANCELLED]: 'Đã hủy',
};

const selectableStatuses: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.SHIPPING,
  OrderStatus.DELIVERED,
  OrderStatus.CANCELLED,
];

interface OrderStatusSelectProps {
  orderId: string;
  currentStatus: OrderStatus;
  onStatusChange?: (newStatus: OrderStatus) => void;
}

export function OrderStatusSelect({
  orderId,
  currentStatus,
  onStatusChange,
}: OrderStatusSelectProps) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const updateStatusMutation = useUpdateOrderStatus();

  async function handleChange(value: string) {
    const newStatus = value as OrderStatus;
    try {
      await updateStatusMutation.mutateAsync({
        orderId,
        orderStatus: newStatus,
      });
      setStatus(newStatus);
      onStatusChange?.(newStatus);
      toast({ title: 'Cập nhật thành công', variant: 'default' });
    } catch {
      toast({ title: 'Cập nhật thất bại', variant: 'destructive' });
    }
  }

  return (
    <Select
      value={status}
      onValueChange={handleChange}
      disabled={updateStatusMutation.isPending}
    >
      <SelectTrigger className="w-44">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {selectableStatuses.map((s) => (
          <SelectItem key={s} value={s}>
            {orderStatusLabels[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
