import { Leaf } from 'lucide-react';
import { SidebarNav } from './sidebar-nav';
import { Separator } from '@/components/ui/separator';

export function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-gray-200 bg-white h-screen sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-green-600">
          <Leaf className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">Long Nhãn</p>
          <p className="text-xs text-gray-500">Admin Panel</p>
        </div>
      </div>
      <Separator />
      <div className="flex-1 overflow-y-auto py-4">
        <SidebarNav />
      </div>
    </aside>
  );
}
