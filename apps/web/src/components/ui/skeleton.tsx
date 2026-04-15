import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

/** Pulse placeholder for loading layouts (cards, blocks, lines). */
export function Skeleton({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted/80', className)}
      {...props}
    />
  );
}
