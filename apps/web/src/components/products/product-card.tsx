'use client';

// Product card — thumbnail, name, price range, stock overlay, quick view button
import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@longnhan/types';
import { getProductLandingDescription } from '@/lib/product-description';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
}

function getPriceRange(product: Product): string {
  const activeVariants = product.variants.filter((v) => v.active || v.isActive);
  if (activeVariants.length === 0) return 'Liên hệ';
  const prices = activeVariants.map((v) => v.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max
    ? formatPrice(min)
    : `${formatPrice(min)} – ${formatPrice(max)}`;
}

export default function ProductCard({
  product,
  onQuickView,
}: ProductCardProps) {
  const images = product.images ?? [];
  const coverImage =
    product.featuredImageUrl ?? images[0] ?? product.imageUrls?.[0];
  const summary = getProductLandingDescription(product);
  const isOutOfStock =
    product.variants.length > 0 &&
    product.variants.every((v) => (v.stock ?? v.stockQuantity ?? 0) <= 0);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
    >
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={product.name}
            width={600}
            height={600}
            loading="eager"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-5xl text-gray-300">
            🌿
          </div>
        )}

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-700">
              Hết hàng
            </span>
          </div>
        )}

        {/* Quick view button — visible on hover */}
        {onQuickView && !isOutOfStock && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onQuickView(product);
            }}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-800 shadow opacity-0 transition-opacity duration-200 group-hover:opacity-100 hover:bg-white"
          >
            Xem nhanh
          </button>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1 line-clamp-2">
          {product.name}
        </h3>
        {summary ? (
          <p className="text-xs text-gray-600 line-clamp-2 mt-1">{summary}</p>
        ) : null}
        <p className="text-green-700 font-bold text-sm">
          {getPriceRange(product)}
        </p>
      </div>
    </Link>
  );
}
