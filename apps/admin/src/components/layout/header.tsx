'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import { UserMenu } from './user-menu';
import { MobileSidebar } from './mobile-sidebar';

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-popover/80 px-4 backdrop-blur-sm lg:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
            aria-label="Mở menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-base font-semibold tracking-tight text-foreground">
            {title}
          </h1>
        </div>
        <UserMenu />
      </header>
      <MobileSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
    </>
  );
}
