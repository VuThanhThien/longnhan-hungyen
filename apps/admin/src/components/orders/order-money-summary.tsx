import { formatCurrency } from '@/lib/utils';

interface Props {
  total: number;
  paid: number;
}

export function OrderMoneySummary({ total, paid }: Props) {
  const outstanding = total - paid;
  const paidTone =
    paid >= total
      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
      : paid <= 0
        ? 'bg-red-100 text-red-800 border-red-200'
        : 'bg-amber-100 text-amber-800 border-amber-200';
  const outstandingTone =
    outstanding <= 0
      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
      : 'bg-amber-100 text-amber-800 border-amber-200';

  return (
    <div className="flex flex-wrap gap-2 text-xs">
      <Chip label="Tổng" value={formatCurrency(total)} />
      <Chip
        label="Đã thanh toán"
        value={formatCurrency(paid)}
        className={paidTone}
      />
      <Chip
        label="Còn lại"
        value={formatCurrency(Math.max(outstanding, 0))}
        className={outstandingTone}
      />
    </div>
  );
}

function Chip({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 ${className ?? 'bg-muted text-foreground border-border'}`}
    >
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium">{value}</span>
    </span>
  );
}
