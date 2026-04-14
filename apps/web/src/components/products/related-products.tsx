import type { Product } from '@longnhan/types';
import ProductGrid from './product-grid';

interface RelatedProductsProps {
  products: Product[];
}

export default function RelatedProducts({ products }: RelatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
      <h2 className="text-xl font-bold text-green-950 mb-4">
        Sản phẩm lien quan
      </h2>
      <ProductGrid products={products} />
    </section>
  );
}
