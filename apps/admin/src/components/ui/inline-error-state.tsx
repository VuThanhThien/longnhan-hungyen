import type { ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InlineErrorStateProps {
  message?: string;
  action?: ReactNode;
  className?: string;
}

export function InlineErrorState({
  message = 'Đã xảy ra lỗi',
  action,
  className,
}: InlineErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 px-6 py-10 text-center',
        className,
      )}
    >
      <AlertCircle className="h-6 w-6 text-destructive/70" />
      <p className="text-sm font-medium text-destructive">{message}</p>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
