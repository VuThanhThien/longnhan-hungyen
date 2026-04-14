// Featured products grid on home page — shows up to 6 active products

import type { Product } from '@longnhan/types';
import ProductCard from '@/components/products/product-card';
import SectionTitleLinkButton from '@/components/ui/section-title-link-button';

interface FeaturedProductsProps {
  products: Product[];
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-14 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <SectionTitleLinkButton
          className="mb-8"
          titleClassName="font-bold text-green-900 not-italic"
          buttonClassName="text-sm font-medium"
          title="Sản phẩm nổi bật"
          actionLabel="Xem tất cả"
          href="/products"
          align="right"
          solid={false}
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
