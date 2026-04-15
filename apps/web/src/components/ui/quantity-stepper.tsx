import { Minus, Plus } from 'lucide-react';

type QuantityStepperProps = {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  ariaLabel: string;
  className?: string;
};

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max,
  ariaLabel,
  className,
}: QuantityStepperProps) {
  const canDec = value > min;
  const canInc = max == null ? true : value < max;

  return (
    <div
      className={[
        'inline-flex h-11 items-center rounded-xl border border-(--brand-forest)/15 bg-(--brand-cream) shadow-sm',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      role="group"
      aria-label={ariaLabel}
      onKeyDown={(e) => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
          e.preventDefault();
          if (canDec) onChange(value - 1);
        }
        if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
          e.preventDefault();
          if (canInc) onChange(value + 1);
        }
      }}
      tabIndex={0}
    >
      <button
        type="button"
        className="grid h-11 w-11 place-items-center text-(--brand-forest) hover:bg-(--brand-gold)/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--brand-gold) focus-visible:ring-offset-2 focus-visible:ring-offset-(--brand-cream) disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => onChange(value - 1)}
        disabled={!canDec}
        aria-label="Giảm số lượng"
      >
        <Minus className="h-4 w-4" aria-hidden />
      </button>
      <div className="w-12 text-center text-sm font-semibold tabular-nums">
        {value}
      </div>
      <button
        type="button"
        className="grid h-11 w-11 place-items-center text-(--brand-forest) hover:bg-(--brand-gold)/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--brand-gold) focus-visible:ring-offset-2 focus-visible:ring-offset-(--brand-cream) disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => onChange(value + 1)}
        disabled={!canInc}
        aria-label="Tăng số lượng"
      >
        <Plus className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
