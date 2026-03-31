import type { Product } from '@longnhan/types';

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
  const priceLabel = minPrice === maxPrice ? formatPrice(minPrice) : `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl md:text-3xl font-bold text-green-950">{product.name}</h1>
      <p className="text-2xl font-bold text-green-700">{priceLabel}</p>
      {product.description ? (
        <p className="text-sm md:text-base text-gray-700 leading-relaxed">{product.description}</p>
      ) : null}
      <div className="rounded-xl border border-green-100 bg-green-50/80 p-4 space-y-2">
        <p className="text-sm">
          <span className="font-semibold text-green-900">Thanh phan:</span>{' '}
          Long nhan Hung Yen tuy chon chat luong cao.
        </p>
        <p className="text-sm">
          <span className="font-semibold text-green-900">Han su dung:</span> 12 thang khi bao quan kho, kin.
        </p>
      </div>
    </div>
  );
}
