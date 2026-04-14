'use client';

import { ChevronDownIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { useQueryStates } from 'nuqs';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import {
  productSearchParamsParsers,
  serializeProductSearchUrl,
} from '@/lib/product-search-params';

const ACCENT = '#E8A240';

const CATEGORY_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'longnhan', label: 'Đặc sản Hưng Yên' },
  { value: 'gift', label: 'Giải pháp quà tặng' },
  { value: 'giftset', label: 'Bộ quà tặng' },
] as const;

interface HeaderSearchBarProps {
  className?: string;
}

export default function HeaderSearchBar({
  className = '',
}: HeaderSearchBarProps) {
  const router = useRouter();
  const [{ q, category }, setSearchParams] = useQueryStates(
    productSearchParamsParsers,
  );

  const submit = useCallback(() => {
    const trimmed = (q ?? '').trim();
    router.push(
      serializeProductSearchUrl('/products', {
        q: trimmed || null,
        category: category || null,
      }),
    );
  }, [q, category, router]);

  return (
    <form
      role="search"
      className={`flex h-10 w-full min-w-0 max-w-xl justify-center ${className}`}
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div
        className="flex min-w-0 flex-1 border border-r-0 bg-white"
        style={{ borderColor: ACCENT }}
      >
        <div className="relative flex w-[6.25rem] shrink-0 items-center pl-0.5 sm:w-[6.75rem]">
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-7 bg-contain bg-left bg-no-repeat opacity-90 sm:w-8"
            style={{ backgroundImage: "url('/bg-search-left.png')" }}
            aria-hidden
          />
          <label htmlFor="header-search-category" className="sr-only">
            Danh mục
          </label>
          <select
            id="header-search-category"
            value={category ?? ''}
            onChange={(e) =>
              setSearchParams({ category: e.target.value || null })
            }
            className="h-full w-full min-w-0 cursor-pointer appearance-none bg-transparent py-0 pr-5 pl-7 text-xs text-(--brand-forest-muted) outline-none sm:pl-8 sm:text-sm"
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value || 'all'} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDownIcon
            className="pointer-events-none absolute right-1 top-1/2 h-3 w-3 -translate-y-1/2 text-(--brand-forest-muted) sm:right-1.5 sm:h-3.5 sm:w-3.5"
            aria-hidden
          />
        </div>

        <div className="flex min-w-0 flex-1 items-center border-l border-[#d1d5db]">
          <label htmlFor="header-search-q" className="sr-only">
            Tìm kiếm sản phẩm
          </label>
          <input
            id="header-search-q"
            type="search"
            name="q"
            value={q ?? ''}
            onChange={(e) => setSearchParams({ q: e.target.value || null })}
            placeholder="Tìm kiếm..."
            autoComplete="off"
            className="h-full min-w-0 flex-1 border-0 bg-transparent px-3 text-sm text-(--brand-forest) placeholder:text-(--brand-forest-muted)/80 outline-none"
          />
        </div>
      </div>

      <button
        type="submit"
        className="flex h-10 w-11 shrink-0 items-center justify-center border transition hover:brightness-95"
        style={{ backgroundColor: ACCENT, borderColor: ACCENT }}
        aria-label="Tìm kiếm"
      >
        <MagnifyingGlassIcon className="h-5 w-5 text-[#5c2e20]" aria-hidden />
      </button>
    </form>
  );
}
