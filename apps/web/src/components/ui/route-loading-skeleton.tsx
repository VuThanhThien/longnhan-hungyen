/** Shared instant-loading UI for App Router `loading.tsx` segments. */

import type { ReactNode } from 'react';
import { ArticleCardSkeleton } from '@/components/ui/article-card-skeleton';
import { ProductCardSkeleton } from '@/components/ui/product-card-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

function BreadcrumbRowSkeleton() {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-2" aria-hidden>
      <Skeleton className="h-4 w-20 bg-gray-100" />
      <span className="text-gray-300">/</span>
      <Skeleton className="h-4 w-24 bg-gray-100" />
    </div>
  );
}

function PageShell({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div
      className="mx-auto max-w-6xl px-4 py-8"
      aria-busy="true"
      aria-live="polite"
      aria-label={label}
    >
      {children}
    </div>
  );
}

/** Home / generic listing — hero block + product-style cards. */
export function RouteLoadingSkeleton() {
  return (
    <PageShell label="Đang tải trang">
      <Skeleton className="mb-8 h-10 max-w-md rounded-lg bg-(--brand-forest)/10" />
      <Skeleton className="mb-10 h-48 w-full max-w-3xl rounded-2xl bg-(--brand-forest)/10" />
      <div className="mb-4 h-8 w-40 animate-pulse rounded-lg bg-(--brand-forest)/10" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </PageShell>
  );
}

export function ProductsRouteSkeleton() {
  return (
    <PageShell label="Đang tải danh mục sản phẩm">
      <BreadcrumbRowSkeleton />
      <Skeleton className="mb-6 h-9 w-64 max-w-full bg-gray-100" />
      <div className="mb-6 flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full bg-gray-100" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </PageShell>
  );
}

export function ProductDetailRouteSkeleton() {
  return (
    <PageShell label="Đang tải chi tiết sản phẩm">
      <BreadcrumbRowSkeleton />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="space-y-3">
          <Skeleton className="aspect-square w-full rounded-xl bg-gray-100" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-16 w-16 shrink-0 rounded-lg bg-gray-100"
              />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-9 w-full bg-gray-100" />
          <Skeleton className="h-9 w-3/4 bg-gray-100" />
          <Skeleton className="h-6 w-40 bg-gray-100" />
          <Skeleton className="h-24 w-full rounded-xl bg-gray-100" />
          <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-6">
            <Skeleton className="h-5 w-40 bg-gray-100" />
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full bg-gray-100" />
            ))}
            <Skeleton className="h-12 w-full rounded-xl bg-gray-100" />
          </div>
        </div>
      </div>
      <div className="mt-10 space-y-3">
        <div className="flex gap-4 border-b border-gray-200 pb-2">
          <Skeleton className="h-8 w-28 bg-gray-100" />
          <Skeleton className="h-8 w-28 bg-gray-100" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full bg-gray-100" />
        ))}
      </div>
      <div className="mt-10">
        <Skeleton className="mb-4 h-7 w-48 bg-gray-100" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </PageShell>
  );
}

export function ArticlesRouteSkeleton() {
  return (
    <PageShell label="Đang tải tin tức">
      <BreadcrumbRowSkeleton />
      <Skeleton className="mb-6 h-9 w-48 bg-gray-100" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ArticleCardSkeleton key={i} />
        ))}
      </div>
    </PageShell>
  );
}

export function ArticleDetailRouteSkeleton() {
  return (
    <PageShell label="Đang tải bài viết">
      <BreadcrumbRowSkeleton />
      <Skeleton className="mb-4 h-10 w-full max-w-2xl bg-gray-100" />
      <Skeleton className="mb-6 h-4 w-40 bg-gray-100" />
      <Skeleton className="mb-6 aspect-video w-full max-w-3xl rounded-xl bg-gray-100" />
      <div className="max-w-3xl space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-4 bg-gray-100"
            style={{ width: `${70 + ((i * 13) % 25)}%` }}
          />
        ))}
      </div>
    </PageShell>
  );
}

export function CartRouteSkeleton() {
  return (
    <PageShell label="Đang tải giỏ hàng">
      <Skeleton className="mb-8 h-9 w-40 bg-gray-100" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex gap-4 rounded-xl border border-gray-200 bg-white p-4"
          >
            <Skeleton className="h-20 w-20 shrink-0 rounded-lg bg-gray-100" />
            <div className="flex flex-1 flex-col justify-center gap-2">
              <Skeleton className="h-4 w-3/5 bg-gray-100" />
              <Skeleton className="h-4 w-24 bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

export function OrderSuccessRouteSkeleton() {
  return (
    <PageShell label="Đang tải trang xác nhận">
      <div className="mx-auto flex max-w-lg flex-col items-center text-center">
        <Skeleton className="mb-6 h-16 w-16 rounded-full bg-gray-100" />
        <Skeleton className="mb-3 h-8 w-64 bg-gray-100" />
        <Skeleton className="mb-8 h-4 w-full max-w-sm bg-gray-100" />
        <Skeleton className="h-11 w-48 rounded-md bg-gray-100" />
      </div>
    </PageShell>
  );
}
