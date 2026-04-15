// Product grid — responsive card layout for product list page

import type { Product } from '@longnhan/types';
import ProductCard from './product-card';

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-4xl mb-4">🌿</p>
        <p className="text-lg">Không có sản phẩm nào.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          imagePriority={index === 0}
        />
      ))}
    </div>
  );
}
