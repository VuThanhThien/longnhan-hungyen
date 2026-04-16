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
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="landing-heading text-balance text-2xl font-bold text-foreground not-italic sm:text-3xl">
            Sản phẩm nổi bật
          </h2>
          <SectionTitleLinkButton
            buttonClassName="text-sm font-medium"
            className="font-bold"
            actionLabel="Xem tất cả"
            href="/products"
            solid={false}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
