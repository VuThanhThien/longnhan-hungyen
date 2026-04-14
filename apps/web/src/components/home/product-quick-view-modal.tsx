'use client';

// Quick view modal — product summary + CTA link, no order form
import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@longnhan/types';
import { getProductLandingDescription } from '@/lib/product-description';

interface ProductQuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
}

function getPriceRange(product: Product): string {
  const active = product.variants.filter((v) => v.active || v.isActive);
  if (active.length === 0) return 'Liên hệ';
  const prices = active.map((v) => v.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max
    ? formatPrice(min)
    : `${formatPrice(min)} – ${formatPrice(max)}`;
}

export function ProductQuickViewModal({
  product,
  onClose,
}: ProductQuickViewModalProps) {
  useEffect(() => {
    if (!product) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    // Lock body scroll while modal is open
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [product, onClose]);

  if (!product) return null;

  const cover =
    product.featuredImageUrl ?? product.images?.[0] ?? product.imageUrls?.[0];
  const summary = getProductLandingDescription(product);

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="absolute right-3 top-3 z-10 rounded-full bg-white/80 p-1.5 text-gray-500 shadow hover:bg-white"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {cover ? (
          <div className="relative aspect-video bg-gray-100">
            <Image
              src={cover}
              alt={product.name}
              fill
              sizes="448px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="aspect-video bg-green-50 flex items-center justify-center text-6xl">
            🌿
          </div>
        )}

        <div className="p-5">
          <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
          <p className="mt-1 text-xl font-bold text-green-700">
            {getPriceRange(product)}
          </p>
          {summary && (
            <p className="mt-2 line-clamp-2 text-sm text-gray-600">{summary}</p>
          )}
          <Link
            href={`/products/${product.slug}`}
            className="mt-4 flex min-h-11 items-center justify-center rounded-lg bg-green-800 text-sm font-semibold text-white transition hover:bg-green-700"
            onClick={onClose}
          >
            Đặt hàng ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
