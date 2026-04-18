import { Leaf } from 'lucide-react';
import { SidebarNav } from './sidebar-nav';
import { Separator } from '@/components/ui/separator';

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex">
      <div className="flex items-center gap-2 px-6 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background">
          <Leaf className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-sidebar-foreground">
            Long Nhãn
          </p>
          <p className="text-xs text-muted-foreground">Admin Panel</p>
        </div>
      </div>
      <Separator />
      <div className="flex-1 overflow-y-auto py-4">
        <SidebarNav />
      </div>
    </aside>
  );
}
