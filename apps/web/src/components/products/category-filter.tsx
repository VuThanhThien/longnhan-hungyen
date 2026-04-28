'use client';

// Category filter tabs — updates URL search params to filter product list (slug = `?category=`)

import type { Category } from '@longnhan/types';
import { useRouter, usePathname } from 'next/navigation';

interface CategoryFilterProps {
  categories: Category[];
  current?: string;
}

export default function CategoryFilter({
  categories,
  current,
}: CategoryFilterProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleSelect = (value: string) => {
    if (value) {
      router.push(`${pathname}?category=${value}`);
    } else {
      router.push(pathname);
    }
  };

  const tabs: { value: string; label: string }[] = [
    { value: '', label: 'Tất cả' },
    ...categories.map((c) => ({ value: c.slug, label: c.name })),
  ];

  return (
    <div className="flex gap-2 mb-6 overflow-x-auto pb-2 sm:flex-wrap sm:overflow-x-visible sm:pb-0">
      {tabs.map((cat) => {
        const isActive = (current ?? '') === cat.value;
        return (
          <button
            key={cat.value || 'all'}
            type="button"
            onClick={() => handleSelect(cat.value)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
              isActive
                ? 'bg-yellow-500 text-white border-yellow-500'
                : 'bg-white text-gray-700 border-gray-300 hover:border-ring/40 hover:text-foreground'
            }`}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
