// Featured products grid on home page — shows up to 6 active products

import Link from 'next/link';
import type { Product } from '@longnhan/types';
import ProductCard from '@/components/products/product-card';

interface FeaturedProductsProps {
  products: Product[];
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-14 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-green-900">
            Sản phẩm nổi bật
          </h2>
          <Link
            href="/products"
            className="text-sm font-medium text-green-700 hover:text-green-900 underline underline-offset-2"
          >
            Xem tất cả →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
