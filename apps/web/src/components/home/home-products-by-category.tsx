// Products grouped by category — falls back to single grid if no category data
import Link from 'next/link';
import type { Product } from '@longnhan/types';
import ProductCard from '@/components/products/product-card';

interface HomeProductsByCategoryProps {
  products: Product[];
  onQuickView?: (product: Product) => void;
}

export function HomeProductsByCategory({ products, onQuickView }: HomeProductsByCategoryProps) {
  if (products.length === 0) return null;

  // Group by category
  const grouped = new Map<string, Product[]>();
  for (const product of products) {
    const key = product.category || 'Sản phẩm';
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(product);
  }

  const categories = Array.from(grouped.entries()).slice(0, 3);
  // Single category — render flat grid like before
  const isSingle = categories.length <= 1;

  return (
    <section className="py-14 bg-white">
      <div className="mx-auto max-w-6xl px-4">
        {isSingle ? (
          <>
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-2xl md:text-3xl font-bold text-green-900">Sản phẩm nổi bật</h2>
              <Link href="/products" className="text-sm font-medium text-green-700 underline underline-offset-2 hover:text-green-900">
                Xem tất cả →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.slice(0, 8).map((p) => (
                <ProductCard key={p.id} product={p} onQuickView={onQuickView} />
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-14">
            {categories.map(([cat, items]) => (
              <div key={cat}>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-green-900 capitalize">{cat}</h2>
                  <Link href={`/products?category=${encodeURIComponent(cat)}`} className="text-sm font-medium text-green-700 underline underline-offset-2 hover:text-green-900">
                    Xem tất cả →
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {items.slice(0, 4).map((p) => (
                    <ProductCard key={p.id} product={p} onQuickView={onQuickView} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
