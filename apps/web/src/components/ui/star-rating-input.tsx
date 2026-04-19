'use client';

import { Star } from 'lucide-react';

import { cn } from '@/lib/utils';

type StarRatingInputProps = {
  value: number;
  onChange: (rating: number) => void;
  disabled?: boolean;
  labelledBy?: string;
};

export function StarRatingInput({
  value,
  onChange,
  disabled,
  labelledBy,
}: StarRatingInputProps) {
  return (
    <div
      className="flex items-center gap-1"
      role="radiogroup"
      aria-labelledby={labelledBy}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const active = value >= star;
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} sao`}
            disabled={disabled}
            onClick={() => onChange(star)}
            className={cn(
              'rounded-md p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
            )}
          >
            <Star
              className={cn(
                'size-8',
                active
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-transparent text-gray-300',
              )}
              strokeWidth={active ? 0 : 1.5}
              aria-hidden
            />
          </button>
        );
      })}
    </div>
  );
}
