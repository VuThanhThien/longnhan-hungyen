'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  FileText,
  Image,
  Star,
  FolderTree,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Tổng quan', icon: LayoutDashboard },
  { href: '/orders', label: 'Đơn hàng', icon: ShoppingCart },
  { href: '/products', label: 'Sản phẩm', icon: Package },
  { href: '/categories', label: 'Danh mục', icon: FolderTree },
  { href: '/articles', label: 'Bài viết', icon: FileText },
  { href: '/reviews', label: 'Đánh giá', icon: Star },
  { href: '/media', label: 'Media', icon: Image },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 px-3">
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive =
          href === '/' ? pathname === '/' : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150',
              isActive
                ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground',
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
