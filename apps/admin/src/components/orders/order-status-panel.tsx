'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { OrderStatus, PaymentStatus } from '@longnhan/types';
import { useUpdateOrderStatus } from '@/features/orders/hooks/use-update-order-status';
import { Button } from '@/components/ui/button';
import { extractErrorMessage } from '@/lib/http/extract-error-message';
import { adminQueryKeys } from '@/lib/query-keys';

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
  const [draftOrderStatus, setDraftOrderStatus] = useState(initialOrderStatus);
  const [draftPaymentStatus, setDraftPaymentStatus] =
    useState(initialPaymentStatus);
  const [baselineOrderStatus, setBaselineOrderStatus] =
    useState(initialOrderStatus);
  const [baselinePaymentStatus, setBaselinePaymentStatus] =
    useState(initialPaymentStatus);
  const queryClient = useQueryClient();
  const updateStatusMutation = useUpdateOrderStatus();

  // Keep draft in sync when the order query refetches (props change).
  /* eslint-disable react-hooks/set-state-in-effect -- controlled reset from server props */
  useEffect(() => {
    setDraftOrderStatus(initialOrderStatus);
    setDraftPaymentStatus(initialPaymentStatus);
    setBaselineOrderStatus(initialOrderStatus);
    setBaselinePaymentStatus(initialPaymentStatus);
  }, [initialOrderStatus, initialPaymentStatus]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const dirty =
    draftOrderStatus !== baselineOrderStatus ||
    draftPaymentStatus !== baselinePaymentStatus;

  function save() {
    updateStatusMutation.mutate(
      {
        orderId,
        orderStatus: draftOrderStatus,
        paymentStatus: draftPaymentStatus,
      },
      {
        onSuccess: async () => {
          setBaselineOrderStatus(draftOrderStatus);
          setBaselinePaymentStatus(draftPaymentStatus);
          await queryClient.invalidateQueries({
            queryKey: adminQueryKeys.orders.all,
          });
          toast.success('Cập nhật trạng thái thành công');
        },
        onError: (err) => {
          toast.error(extractErrorMessage(err));
        },
      },
    );
  }

  const pending = updateStatusMutation.isPending;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <label
            htmlFor="orderStatus"
            className="text-sm text-muted-foreground"
          >
            Trạng thái đơn
          </label>
          <select
            id="orderStatus"
            value={draftOrderStatus}
            onChange={(event) =>
              setDraftOrderStatus(event.target.value as OrderStatus)
            }
            disabled={pending}
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
            value={draftPaymentStatus}
            onChange={(event) =>
              setDraftPaymentStatus(event.target.value as PaymentStatus)
            }
            disabled={pending}
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
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          className="cursor-pointer"
          disabled={pending || !dirty}
          onClick={() => save()}
        >
          {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Lưu thay đổi
        </Button>
        <Button
          type="button"
          variant="outline"
          className="cursor-pointer"
          disabled={pending || !dirty}
          onClick={() => {
            setDraftOrderStatus(baselineOrderStatus);
            setDraftPaymentStatus(baselinePaymentStatus);
          }}
        >
          Hoàn tác
        </Button>
      </div>
    </div>
  );
}
