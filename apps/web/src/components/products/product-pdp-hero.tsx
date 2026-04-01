import type { Product } from '@longnhan/types';
import Link from 'next/link';

interface ProductPdpHeroProps {
  product: Product;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

export default function ProductPdpHero({ product }: ProductPdpHeroProps) {
  const activeVariants = product.variants.filter((variant) => variant.active || variant.isActive);
  const variantsForPrice = activeVariants.length > 0 ? activeVariants : product.variants;
  const prices = variantsForPrice.map((variant) => variant.price);
  const minPrice = prices.length > 0 ? Math.min(...prices) : product.basePrice;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : product.basePrice;
  const priceLabel =
    minPrice === maxPrice ? formatPrice(minPrice) : `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;

  // Tags from product (cast for API data that may include tags not in current type)
  const tags = (product as unknown as { tags?: string[] }).tags;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl md:text-3xl font-bold text-green-950">{product.name}</h1>

      {/* Category chip */}
      {product.category && (
        <Link
          href={`/products?category=${encodeURIComponent(product.category)}`}
          className="inline-block rounded-full bg-green-50 px-3 py-0.5 text-xs font-medium text-green-700 border border-green-200 hover:bg-green-100 transition"
        >
          {product.category}
        </Link>
      )}

      <p className="text-2xl font-bold text-green-700">{priceLabel}</p>

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600">
              {tag}
            </span>
          ))}
        </div>
      )}

      {product.description ? (
        <p className="text-sm md:text-base text-gray-700 leading-relaxed">{product.description}</p>
      ) : null}

      <div className="rounded-xl border border-green-100 bg-green-50/80 p-4 space-y-2">
        <p className="text-sm">
          <span className="font-semibold text-green-900">Thành phần:</span>{' '}
          Long nhãn Hưng Yên tuyển chọn chất lượng cao.
        </p>
        <p className="text-sm">
          <span className="font-semibold text-green-900">Hạn sử dụng:</span> 12 tháng khi bảo quản khô, kín.
        </p>
      </div>
    </div>
  );
}
