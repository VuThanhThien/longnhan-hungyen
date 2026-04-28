'use client';

import { ChevronDownIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { serializeProductSearchUrl } from '@/lib/product-search-params';
import {
  addRecent,
  readRecents,
  type RecentQuery,
} from '@/lib/header-search-recent-queries';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useProductSuggestions } from '@/services/product-suggestions';
import HeaderSearchSuggestions, {
  getOptionsCount,
  type SuggestionOption,
} from './header-search-suggestions';

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
  const [inputQ, setInputQ] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [composing, setComposing] = useState(false);
  const [recents, setRecents] = useState<RecentQuery[]>([]);
  const wrapperRef = useRef<HTMLFormElement>(null);

  const trimmedQ = inputQ.trim();
  const debouncedQ = useDebouncedValue(trimmedQ, 250);

  const {
    data: suggestions,
    isLoading,
    isError,
  } = useProductSuggestions(debouncedQ, open && !composing);

  const apiCategories = useMemo(
    () => suggestions?.categories ?? [],
    [suggestions?.categories],
  );
  const apiProducts = useMemo(
    () => suggestions?.products ?? [],
    [suggestions?.products],
  );

  const optionsCount = getOptionsCount(
    trimmedQ,
    recents.length,
    apiCategories.length,
    apiProducts.length,
  );

  const refreshRecents = useCallback(() => setRecents(readRecents()), []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navigate = useCallback(
    (url: string) => {
      setOpen(false);
      setInputQ('');
      router.push(url);
    },
    [router],
  );

  const handleSelect = useCallback(
    (option: SuggestionOption) => {
      setOpen(false);
      switch (option.type) {
        case 'recent':
          navigate(
            serializeProductSearchUrl('/products', {
              q: option.item.q,
              category: option.item.category || null,
            }),
          );
          break;
        case 'category':
          addRecent({
            q: trimmedQ || option.item.name,
            category: option.item.slug,
          });
          navigate(
            serializeProductSearchUrl('/products', {
              q: null,
              category: option.item.slug,
            }),
          );
          break;
        case 'product':
          addRecent({ q: trimmedQ, category: selectedCategory || null });
          navigate(`/products/${option.item.slug}`);
          break;
      }
    },
    [navigate, trimmedQ, selectedCategory],
  );

  const submit = useCallback(() => {
    if (trimmedQ) {
      addRecent({ q: trimmedQ, category: selectedCategory || null });
    }
    setOpen(false);
    const url = serializeProductSearchUrl('/products', {
      q: trimmedQ || null,
      category: selectedCategory || null,
    });
    setInputQ('');
    router.push(url);
  }, [trimmedQ, selectedCategory, router]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open || composing || e.nativeEvent.isComposing) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex((prev) => (prev < optionsCount - 1 ? prev + 1 : prev));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case 'Enter':
          if (activeIndex >= 0) {
            e.preventDefault();
            const options: SuggestionOption[] = [];
            if (trimmedQ.length === 0) {
              recents.forEach((r) => options.push({ type: 'recent', item: r }));
            } else if (trimmedQ.length >= 2) {
              apiCategories.forEach((c) =>
                options.push({ type: 'category', item: c }),
              );
              apiProducts.forEach((p) =>
                options.push({ type: 'product', item: p }),
              );
            }
            const selected = options[activeIndex];
            if (selected) handleSelect(selected);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setOpen(false);
          setActiveIndex(-1);
          break;
      }
    },
    [
      open,
      composing,
      activeIndex,
      optionsCount,
      trimmedQ,
      recents,
      apiCategories,
      apiProducts,
      handleSelect,
    ],
  );

  const hasDropdownContent =
    (trimmedQ.length === 0 && recents.length > 0) || trimmedQ.length >= 2;

  return (
    <form
      ref={wrapperRef}
      role="search"
      className={`relative flex h-10 w-full min-w-0 max-w-xl justify-center ${className}`}
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div
        className="flex min-w-0 flex-1 border border-r-0 bg-white"
        style={{ borderColor: ACCENT }}
      >
        <div className="group relative flex w-25 shrink-0 items-center pl-0.5 transition-transform duration-200 ease-out hover:-translate-y-px hover:scale-[1.01] sm:w-27">
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-7 bg-contain bg-left bg-no-repeat opacity-90 transition-opacity duration-200 ease-out group-hover:opacity-100 sm:w-8"
            style={{ backgroundImage: "url('/bg-search-left.png')" }}
            aria-hidden
          />
          <label htmlFor="header-search-category" className="sr-only">
            Danh mục
          </label>
          <select
            id="header-search-category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-full w-full min-w-0 cursor-pointer appearance-none bg-transparent py-0 pr-5 pl-7 text-xs text-(--brand-forest-muted) outline-none transition-colors duration-200 ease-out group-hover:text-(--brand-forest) sm:pl-8 sm:text-sm"
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value || 'all'} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDownIcon
            className="pointer-events-none absolute right-1 top-1/2 h-3 w-3 -translate-y-1/2 text-(--brand-forest-muted) transition-transform duration-200 ease-out group-hover:translate-x-px sm:right-1.5 sm:h-3.5 sm:w-3.5"
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
            value={inputQ}
            onChange={(e) => {
              setInputQ(e.target.value);
              setActiveIndex(-1);
            }}
            onFocus={() => {
              setOpen(true);
              refreshRecents();
            }}
            onCompositionStart={() => setComposing(true)}
            onCompositionEnd={() => setComposing(false)}
            onKeyDown={handleKeyDown}
            placeholder="Tìm kiếm..."
            autoComplete="off"
            role="combobox"
            aria-expanded={open && hasDropdownContent}
            aria-controls="header-search-listbox"
            aria-autocomplete="list"
            aria-activedescendant={
              activeIndex >= 0
                ? `header-search-option-${activeIndex}`
                : undefined
            }
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

      {open && hasDropdownContent && (
        <HeaderSearchSuggestions
          q={trimmedQ}
          recents={recents}
          categories={apiCategories}
          products={apiProducts}
          isLoading={isLoading}
          isError={isError}
          activeIndex={activeIndex}
          onSelect={handleSelect}
          onActiveIndexChange={setActiveIndex}
          onRecentsChange={refreshRecents}
        />
      )}
    </form>
  );
}
