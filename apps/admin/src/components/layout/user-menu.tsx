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
        <button className="flex items-center gap-2 rounded-md p-1 hover:bg-gray-100 transition-colors outline-none">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-green-100 text-green-700">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-gray-700 hidden sm:block">Admin</span>
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
          className="flex items-center gap-2 text-red-600"
        >
          <LogOut className="h-4 w-4" />
          Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
