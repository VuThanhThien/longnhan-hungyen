'use client';

// Category filter tabs — updates URL search params to filter product list

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

const CATEGORIES = [
  { value: '', label: 'Tất cả' },
  { value: 'long-nhan-say', label: 'Long nhãn sấy' },
  { value: 'nhan-tuoi', label: 'Nhãn tươi' },
  { value: 'qua-tang', label: 'Quà tặng' },
];

interface CategoryFilterProps {
  current?: string;
}

export default function CategoryFilter({ current }: CategoryFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSelect = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('category', value);
    } else {
      params.delete('category');
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {CATEGORIES.map((cat) => {
        const isActive = (current ?? '') === cat.value;
        return (
          <button
            key={cat.value}
            onClick={() => handleSelect(cat.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
              isActive
                ? 'bg-green-700 text-white border-green-700'
                : 'bg-white text-gray-700 border-gray-300 hover:border-green-500 hover:text-green-700'
            }`}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
