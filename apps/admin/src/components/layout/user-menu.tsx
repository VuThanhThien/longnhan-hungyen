'use client';

import { useRef } from 'react';
import { LogOut, User } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { logoutAction } from '@/lib/auth';

export function UserMenu() {
  const logoutFormRef = useRef<HTMLFormElement>(null);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg p-1 outline-none transition-colors hover:bg-muted"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-muted text-accent">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-medium text-foreground sm:block">
            Admin
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Tài khoản</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <form ref={logoutFormRef} action={logoutAction} />
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault();
            logoutFormRef.current?.requestSubmit();
          }}
          className="flex items-center gap-2 text-destructive focus:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
