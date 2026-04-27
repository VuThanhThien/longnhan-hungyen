import { AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface DashboardErrorStateProps {
  message?: string;
}

export function DashboardErrorState({
  message = 'Không thể tải dữ liệu tổng quan. Vui lòng thử lại.',
}: DashboardErrorStateProps) {
  return (
    <Card className="border-destructive/20 bg-destructive/5">
      <CardContent role="alert" className="flex items-center gap-3 py-5">
        <AlertTriangle className="h-5 w-5 shrink-0 text-destructive/70" />
        <p className="text-sm text-destructive">{message}</p>
      </CardContent>
    </Card>
  );
}
