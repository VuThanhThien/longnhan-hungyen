// Product grid — responsive card layout for product list page

import type { Product } from '@longnhan/types';
import Image from 'next/image';
import ProductCard from './product-card';

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <Image
          src="/logo.png"
          alt="Logo Long Nhãn Tống Trân"
          width={64}
          height={64}
          className="mx-auto mb-4 opacity-80"
        />
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
