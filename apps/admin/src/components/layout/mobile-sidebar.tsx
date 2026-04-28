'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Leaf } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { SidebarNav } from './sidebar-nav';

interface MobileSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileSidebar({ open, onOpenChange }: MobileSidebarProps) {
  const pathname = usePathname();
  const prevPathnameRef = useRef(pathname);

  useEffect(() => {
    if (pathname !== prevPathnameRef.current) {
      onOpenChange(false);
      prevPathnameRef.current = pathname;
    }
  }, [pathname, onOpenChange]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-60 p-0"
        aria-describedby={undefined}
      >
        <SheetTitle className="sr-only">Menu điều hướng</SheetTitle>
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
      </SheetContent>
    </Sheet>
  );
}
