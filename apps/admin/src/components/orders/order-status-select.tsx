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

const orderStatusLabels: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]:    'Chờ xác nhận',
  [OrderStatus.CONFIRMED]:  'Đã xác nhận',
  [OrderStatus.PROCESSING]: 'Đang xử lý',
  [OrderStatus.SHIPPED]:    'Đang giao',
  [OrderStatus.DELIVERED]:  'Đã giao',
  [OrderStatus.CANCELLED]:  'Đã hủy',
};

interface OrderStatusSelectProps {
  orderId: number;
  currentStatus: OrderStatus;
  onStatusChange?: (newStatus: OrderStatus) => void;
}

export function OrderStatusSelect({ orderId, currentStatus, onStatusChange }: OrderStatusSelectProps) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [loading, setLoading] = useState(false);

  async function handleChange(value: string) {
    const newStatus = value as OrderStatus;
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      if (!res.ok) throw new Error('Failed');
      setStatus(newStatus);
      onStatusChange?.(newStatus);
      toast({ title: 'Cập nhật thành công', variant: 'default' });
    } catch {
      toast({ title: 'Cập nhật thất bại', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Select value={status} onValueChange={handleChange} disabled={loading}>
      <SelectTrigger className="w-44">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.values(OrderStatus).map((s) => (
          <SelectItem key={s} value={s}>
            {orderStatusLabels[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
