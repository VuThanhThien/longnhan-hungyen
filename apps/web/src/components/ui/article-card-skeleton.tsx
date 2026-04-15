import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

/** Matches `ArticleCard` shell: wide media + meta + title + excerpt. */
export function ArticleCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm',
        className,
      )}
      aria-hidden
    >
      <Skeleton className="aspect-video w-full rounded-none bg-gray-100" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-3 w-24 bg-gray-100" />
        <Skeleton className="h-4 w-full bg-gray-100" />
        <Skeleton className="h-4 w-[92%] bg-gray-100" />
        <Skeleton className="h-3 w-full bg-gray-100" />
        <Skeleton className="h-3 w-full bg-gray-100" />
        <Skeleton className="h-3 w-2/3 bg-gray-100" />
      </div>
    </div>
  );
}
