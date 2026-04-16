import type { PublicOrderSummary } from '@/actions/order-tracking-actions';

import { OrderStatusTimeline } from '@/components/orders/order-status-timeline';

export function paymentMethodLabel(pm: string): string {
  switch (pm) {
    case 'cod':
      return 'Thu hộ (COD)';
    case 'bank_transfer':
      return 'Chuyển khoản ngân hàng';
    default:
      return pm;
  }
}

export function paymentStatusLabel(ps: string): string {
  switch (ps) {
    case 'pending':
      return 'Chưa thanh toán';
    case 'paid':
      return 'Đã thanh toán';
    case 'failed':
      return 'Thanh toán thất bại';
    default:
      return ps;
  }
}

export function OrderSummaryPanel({ data }: { data: PublicOrderSummary }) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-gradient-to-br from-muted/40 to-background p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Mã đơn hàng
            </p>
            <p className="mt-1 font-mono text-lg font-semibold tracking-tight text-foreground">
              {data.code}
            </p>
          </div>
          {data.province ? (
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              {data.province}
            </span>
          ) : null}
        </div>

        <div className="my-4 h-px w-full bg-border" role="separator" />

        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Tổng tiền</dt>
            <dd className="mt-0.5 text-lg font-semibold tabular-nums">
              {data.total.toLocaleString('vi-VN')}₫
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Hình thức thanh toán</dt>
            <dd className="mt-0.5 font-medium">
              {paymentMethodLabel(data.paymentMethod)}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Trạng thái thanh toán</dt>
            <dd className="mt-0.5 font-medium">
              {paymentStatusLabel(data.paymentStatus)}
            </dd>
          </div>
        </dl>
      </div>

      <div>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Tiến trình đơn hàng
        </h2>
        <OrderStatusTimeline orderStatus={data.orderStatus} />
      </div>

      {data.items?.length ? (
        <div className="rounded-2xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground">Sản phẩm</h3>
          <ul className="mt-3 space-y-3">
            {data.items.map((item, idx) => (
              <li
                key={`${item.name}-${idx}`}
                className="flex items-start justify-between gap-3 border-b border-border/60 pb-3 last:border-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="font-medium leading-snug text-foreground">
                    {item.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Số lượng: {item.qty}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold tabular-nums">
                  {item.subtotal.toLocaleString('vi-VN')}₫
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
