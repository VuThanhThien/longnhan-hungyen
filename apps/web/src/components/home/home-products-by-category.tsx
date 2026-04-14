// Products grouped by category — falls back to single grid if no category data
import type { Product } from '@longnhan/types';
import ProductCard from '@/components/products/product-card';
import SectionTitleLinkButton from '@/components/ui/section-title-link-button';

interface HomeProductsByCategoryProps {
  products: Product[];
  onQuickView?: (product: Product) => void;
}

export function HomeProductsByCategory({
  products,
  onQuickView,
}: HomeProductsByCategoryProps) {
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
            <SectionTitleLinkButton
              className="mb-8"
              titleClassName="font-bold text-green-900 not-italic"
              buttonClassName="text-green-700 hover:text-green-900 text-sm font-medium"
              title="Sản phẩm nổi bật"
              actionLabel="Xem tất cả"
              href="/products"
              align="right"
              solid={false}
            />
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
                <SectionTitleLinkButton
                  className="mb-6"
                  headingAs="h3"
                  titleClassName="text-xl font-bold text-green-900 capitalize not-italic"
                  buttonClassName="text-green-700 hover:text-green-900 text-sm font-medium"
                  title={cat}
                  actionLabel="Xem tất cả"
                  href={`/products?category=${encodeURIComponent(cat)}`}
                  align="right"
                  solid={false}
                />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {items.slice(0, 4).map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      onQuickView={onQuickView}
                    />
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
