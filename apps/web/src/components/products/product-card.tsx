'use client';

// Product card — full-width cover image, then title/description/footer sections
import type { Product } from '@longnhan/types';
import { Eye, ImageOff, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';

import { VariantPickerSheet } from '@/components/products/variant-picker-sheet';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  getProductLandingDescription,
  splitLandingDescriptionForCard,
} from '@/lib/product-description';
import { useCartStore } from '@/services/cart/cart-store';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  /** Set on the first card in a grid so the listing LCP image loads early. */
  imagePriority?: boolean;
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

function getAvailabilitySubtitle(
  isOutOfStock: boolean,
  variantCount: number,
): string {
  if (isOutOfStock) return 'Hết hàng';
  if (variantCount > 1) return `${variantCount} lựa chọn`;
  return 'Còn hàng';
}

const primaryActionClassName =
  'inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border-0 bg-gray-900 px-4 text-sm font-semibold text-white shadow-none hover:bg-gray-800 focus-visible:ring-gray-400';

export default function ProductCard({
  product,
  onQuickView,
  imagePriority = false,
}: ProductCardProps) {
  const upsertLine = useCartStore((s) => s.upsertLine);
  const images = product.images ?? [];
  const coverImage =
    product.featuredImageUrl ?? images[0] ?? product.imageUrls?.[0];
  const summary = getProductLandingDescription(product);
  const { headline, body } = splitLandingDescriptionForCard(summary);
  const isOutOfStock =
    product.variants.length > 0 &&
    product.variants.every((v) => (v.stock ?? v.stockQuantity ?? 0) <= 0);

  const activeVariants = product.variants.filter((v) => v.active || v.isActive);
  const inStockActiveVariants = activeVariants.filter(
    (v) => (v.stock ?? v.stockQuantity ?? 0) > 0,
  );
  const isSingleVariant = inStockActiveVariants.length === 1;
  const cartImageUrl = coverImage ?? null;
  const priceLabel = getPriceRange(product);
  const subtitle = getAvailabilitySubtitle(
    isOutOfStock,
    inStockActiveVariants.length,
  );

  return (
    <Card className="group flex flex-col overflow-hidden transition-shadow hover:shadow-md">
      {/* Full-width cover image */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
        <Link
          href={`/products/${product.slug}`}
          className="block h-full w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gray-400"
          aria-label={product.name}
        >
          {coverImage ? (
            <Image
              src={coverImage}
              alt={product.name}
              width={600}
              height={600}
              priority={imagePriority}
              sizes="(max-width: 1023px) 50vw, 34vw"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div
              className="flex h-full items-center justify-center text-gray-300"
              aria-hidden
            >
              <ImageOff className="h-16 w-16" strokeWidth={1.25} />
            </div>
          )}
        </Link>

        {isOutOfStock ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-700">
              Hết hàng
            </span>
          </div>
        ) : null}
      </div>

      {/* Title + meta */}
      <div className="border-t border-gray-100 p-4 pb-3">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/products/${product.slug}`}
            className="min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
          >
            <h3 className="text-[15px] font-semibold leading-snug tracking-tight text-gray-900 line-clamp-2">
              {product.name}
            </h3>
          </Link>
          {onQuickView && !isOutOfStock ? (
            <button
              type="button"
              onClick={() => onQuickView(product)}
              className="shrink-0 rounded-lg p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
              aria-label="Xem nhanh"
            >
              <Eye className="h-4 w-4" aria-hidden />
            </button>
          ) : null}
        </div>
        <Badge
          variant={isOutOfStock ? 'destructive' : 'secondary'}
          className={
            isOutOfStock
              ? 'mt-0.5 font-medium'
              : 'mt-0.5 font-normal text-gray-600'
          }
        >
          {subtitle}
        </Badge>
      </div>

      {/* Body — bold lead + supporting copy */}
      {summary ? (
        <div className=" px-4 pb-3">
          {body ? (
            <p
              className={`text-sm leading-relaxed text-gray-500 line-clamp-3 ${headline ? 'mt-1.5' : ''}`}
            >
              {body}
            </p>
          ) : null}
        </div>
      ) : null}

      {/* Footer — price row + full-width actions */}
      <div className="mt-auto border-t border-gray-100 p-4">
        <div className="space-y-3">
          <p
            className="w-full min-w-0 truncate text-sm font-semibold tabular-nums tracking-tight text-gray-900"
            title={priceLabel}
          >
            {priceLabel}
          </p>

          {!isOutOfStock && isSingleVariant ? (
            <button
              type="button"
              className={`${primaryActionClassName} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2`}
              onClick={() => {
                const v = inStockActiveVariants[0];
                if (!v) return;
                upsertLine({
                  variantId: v.id,
                  quantity: 1,
                  unitPriceVnd: v.price,
                  productName: product.name,
                  productSlug: product.slug,
                  variantLabel: v.label ?? v.name ?? '',
                  imageUrl: cartImageUrl,
                });
                toast.success(`Đã thêm ${product.name} vào giỏ hàng.`, {
                  duration: 3000,
                });
              }}
              aria-label={`Thêm ${product.name} vào giỏ hàng`}
            >
              <ShoppingCart className="h-4 w-4 shrink-0" aria-hidden />
              Thêm vào giỏ
            </button>
          ) : null}

          {!isOutOfStock && !isSingleVariant ? (
            <VariantPickerSheet
              product={product}
              imageUrl={cartImageUrl}
              triggerClassName={`${primaryActionClassName} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2`}
              onConfirm={(payload) => {
                upsertLine(payload);
                toast.success(`Đã thêm ${product.name} vào giỏ hàng.`, {
                  duration: 3000,
                });
              }}
            />
          ) : null}

          {isOutOfStock ? (
            <button
              type="button"
              disabled
              className="inline-flex h-11 w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-100 px-4 text-sm font-semibold text-gray-500"
            >
              Hết hàng
            </button>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
