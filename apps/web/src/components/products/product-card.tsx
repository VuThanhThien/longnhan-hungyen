// Product card — thumbnail, name, price range, link to detail page

import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@longnhan/types';

interface ProductCardProps {
  product: Product;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

function getPriceRange(product: Product): string {
  const activeVariants = product.variants.filter((v) => v.active || v.isActive);
  if (activeVariants.length === 0) return 'Liên hệ';
  const prices = activeVariants.map((v) => v.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? formatPrice(min) : `${formatPrice(min)} – ${formatPrice(max)}`;
}

export default function ProductCard({ product }: ProductCardProps) {
  const images = product.images ?? [];
  const coverImage = product.featuredImageUrl ?? images[0] ?? product.imageUrls?.[0];

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
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-5xl text-gray-300">🌿</div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-green-700 font-bold text-sm">{getPriceRange(product)}</p>
      </div>
    </Link>
  );
}
