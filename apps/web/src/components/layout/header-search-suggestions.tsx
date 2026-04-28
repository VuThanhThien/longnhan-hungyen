'use client';

import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import type { RecentQuery } from '@/lib/header-search-recent-queries';
import { removeRecent, clearRecents } from '@/lib/header-search-recent-queries';
import type {
  CategorySuggestionItem,
  ProductSuggestionItem,
} from '@/services/product-suggestions';

const priceFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
});

export type SuggestionOption =
  | { type: 'recent'; item: RecentQuery }
  | { type: 'category'; item: CategorySuggestionItem }
  | { type: 'product'; item: ProductSuggestionItem };

interface HeaderSearchSuggestionsProps {
  q: string;
  recents: RecentQuery[];
  categories: CategorySuggestionItem[];
  products: ProductSuggestionItem[];
  isLoading: boolean;
  isError: boolean;
  activeIndex: number;
  onSelect: (option: SuggestionOption) => void;
  onActiveIndexChange: (index: number) => void;
  onRecentsChange: () => void;
}

export default function HeaderSearchSuggestions({
  q,
  recents,
  categories,
  products,
  isLoading,
  isError,
  activeIndex,
  onSelect,
  onActiveIndexChange,
  onRecentsChange,
}: HeaderSearchSuggestionsProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const trimmed = q.trim();
  const showRecents = trimmed.length === 0 && recents.length > 0;
  const showApi = trimmed.length >= 2;

  const options: SuggestionOption[] = [];
  if (showRecents) {
    recents.forEach((r) => options.push({ type: 'recent', item: r }));
  }
  if (showApi) {
    categories.forEach((c) => options.push({ type: 'category', item: c }));
    products.forEach((p) => options.push({ type: 'product', item: p }));
  }

  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const el = listRef.current.children[activeIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  if (!showRecents && !showApi) return null;
  if (showApi && !isLoading && !isError && options.length === 0) {
    return (
      <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-md border border-gray-200 bg-white py-3 text-center text-sm text-gray-500 shadow-lg">
        Không tìm thấy gợi ý
      </div>
    );
  }

  return (
    <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
      <ul
        ref={listRef}
        id="header-search-listbox"
        role="listbox"
        className="max-h-80 overflow-y-auto py-1"
      >
        {showRecents && (
          <>
            <li
              role="presentation"
              className="flex items-center justify-between px-3 py-1.5"
            >
              <span className="text-xs font-medium text-gray-400 uppercase">
                Tìm kiếm gần đây
              </span>
              <button
                type="button"
                className="text-xs text-gray-400 hover:text-gray-600"
                onMouseDown={(e) => {
                  e.preventDefault();
                  clearRecents();
                  onRecentsChange();
                }}
              >
                Xóa tất cả
              </button>
            </li>
            {recents.map((r, i) => (
              <li
                key={`recent-${i}`}
                id={`header-search-option-${i}`}
                role="option"
                aria-selected={activeIndex === i}
                className={`flex cursor-pointer items-center gap-2 px-3 py-2 text-sm ${
                  activeIndex === i
                    ? 'bg-amber-50 text-amber-900'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onMouseEnter={() => onActiveIndexChange(i)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelect({ type: 'recent', item: r });
                }}
              >
                <MagnifyingGlassIcon className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                <span className="truncate">{r.q}</span>
                {r.category && (
                  <span className="ml-auto shrink-0 text-xs text-gray-400">
                    {r.category}
                  </span>
                )}
                <button
                  type="button"
                  className="ml-1 shrink-0 text-xs text-gray-300 hover:text-gray-500"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeRecent(r);
                    onRecentsChange();
                  }}
                  aria-label={`Xóa "${r.q}"`}
                >
                  ✕
                </button>
              </li>
            ))}
          </>
        )}

        {showApi && isLoading && (
          <li className="px-3 py-3 text-center text-sm text-gray-400">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-amber-500" />
          </li>
        )}

        {showApi && isError && (
          <li className="px-3 py-3 text-center text-sm text-gray-400">
            Không thể tải gợi ý
          </li>
        )}

        {showApi && !isLoading && !isError && (
          <>
            {categories.length > 0 && (
              <>
                <li role="presentation" className="px-3 py-1.5">
                  <span className="text-xs font-medium text-gray-400 uppercase">
                    Danh mục
                  </span>
                </li>
                {categories.map((c, ci) => {
                  const idx = ci;
                  return (
                    <li
                      key={`cat-${c.slug}`}
                      id={`header-search-option-${idx}`}
                      role="option"
                      aria-selected={activeIndex === idx}
                      className={`cursor-pointer px-3 py-2 text-sm ${
                        activeIndex === idx
                          ? 'bg-amber-50 text-amber-900'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      onMouseEnter={() => onActiveIndexChange(idx)}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        onSelect({ type: 'category', item: c });
                      }}
                    >
                      {c.name}
                    </li>
                  );
                })}
              </>
            )}

            {products.length > 0 && (
              <>
                <li role="presentation" className="px-3 py-1.5">
                  <span className="text-xs font-medium text-gray-400 uppercase">
                    Sản phẩm
                  </span>
                </li>
                {products.map((p, pi) => {
                  const idx = categories.length + pi;
                  return (
                    <li
                      key={`prod-${p.slug}`}
                      id={`header-search-option-${idx}`}
                      role="option"
                      aria-selected={activeIndex === idx}
                      className={`flex cursor-pointer items-center gap-3 px-3 py-2 ${
                        activeIndex === idx ? 'bg-amber-50' : 'hover:bg-gray-50'
                      }`}
                      onMouseEnter={() => onActiveIndexChange(idx)}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        onSelect({ type: 'product', item: p });
                      }}
                    >
                      {p.featuredImageUrl && (
                        <Image
                          src={p.featuredImageUrl}
                          alt={p.name}
                          width={36}
                          height={36}
                          className="h-9 w-9 shrink-0 rounded object-cover"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-gray-800">
                          {p.name}
                        </p>
                        <p className="text-xs text-amber-700">
                          {priceFormatter.format(p.basePrice)}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </>
            )}
          </>
        )}
      </ul>
    </div>
  );
}

export function getOptionsCount(
  q: string,
  recentsCount: number,
  categoriesCount: number,
  productsCount: number,
): number {
  const trimmed = q.trim();
  if (trimmed.length === 0) return recentsCount;
  if (trimmed.length >= 2) return categoriesCount + productsCount;
  return 0;
}
