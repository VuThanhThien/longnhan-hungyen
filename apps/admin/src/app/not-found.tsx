import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-muted-foreground/25">404</h1>
        <h2 className="text-xl font-semibold text-foreground/90">
          Trang không tìm thấy
        </h2>
        <p className="text-muted-foreground">
          Trang bạn đang tìm kiếm không tồn tại.
        </p>
        <Button asChild>
          <Link href="/">Về trang chủ</Link>
        </Button>
      </div>
    </div>
  );
}
