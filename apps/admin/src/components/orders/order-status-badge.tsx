import { Badge } from '@/components/ui/badge';
import { OrderStatus, PaymentStatus } from '@longnhan/types';

const orderStatusConfig: Record<
  OrderStatus,
  {
    label: string;
    variant:
      | 'default'
      | 'secondary'
      | 'destructive'
      | 'warning'
      | 'success'
      | 'info'
      | 'outline';
  }
> = {
  [OrderStatus.PENDING]: { label: 'Chờ xác nhận', variant: 'warning' },
  [OrderStatus.CONFIRMED]: { label: 'Đã xác nhận', variant: 'info' },
  [OrderStatus.PROCESSING]: { label: 'Đang xử lý', variant: 'info' },
  [OrderStatus.SHIPPED]: { label: 'Đang giao', variant: 'secondary' },
  [OrderStatus.DELIVERED]: { label: 'Đã giao', variant: 'success' },
  [OrderStatus.CANCELLED]: { label: 'Đã hủy', variant: 'destructive' },
};

const paymentStatusConfig: Record<
  PaymentStatus,
  {
    label: string;
    variant:
      | 'default'
      | 'secondary'
      | 'destructive'
      | 'warning'
      | 'success'
      | 'info'
      | 'outline';
  }
> = {
  [PaymentStatus.PENDING]: { label: 'Chờ thanh toán', variant: 'warning' },
  [PaymentStatus.CONFIRMED]: { label: 'Đã thanh toán', variant: 'success' },
  [PaymentStatus.FAILED]: { label: 'Thất bại', variant: 'destructive' },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const config = orderStatusConfig[status] ?? {
    label: status,
    variant: 'secondary' as const,
  };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const config = paymentStatusConfig[status] ?? {
    label: status,
    variant: 'secondary' as const,
  };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
