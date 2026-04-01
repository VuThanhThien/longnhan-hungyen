'use client';

// Client wrapper managing quick-view state for home page product display
import { useState } from 'react';
import type { Product } from '@longnhan/types';
import { HomeProductsByCategory } from './home-products-by-category';
import { ProductQuickViewModal } from './product-quick-view-modal';

interface HomeProductsSectionProps {
  products: Product[];
}

export function HomeProductsSection({ products }: HomeProductsSectionProps) {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  return (
    <>
      <HomeProductsByCategory products={products} onQuickView={setQuickViewProduct} />
      <ProductQuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </>
  );
}
