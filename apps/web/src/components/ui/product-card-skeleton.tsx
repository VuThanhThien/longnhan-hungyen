import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

/** Matches `ProductCard` shell: square media + text block. */
export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm',
        className,
      )}
      aria-hidden
    >
      <Skeleton className="aspect-square w-full rounded-none bg-gray-100" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-4 w-full bg-gray-100" />
        <Skeleton className="h-4 w-[85%] bg-gray-100" />
        <Skeleton className="mt-2 h-3 w-full bg-gray-100" />
        <Skeleton className="h-4 w-28 bg-gray-100" />
      </div>
    </div>
  );
}
