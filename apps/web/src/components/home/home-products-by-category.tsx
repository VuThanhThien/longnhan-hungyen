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
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="landing-heading text-balance text-2xl font-bold text-green-900 not-italic sm:text-3xl">
                Sản phẩm nổi bật
              </h2>
              <SectionTitleLinkButton
                buttonClassName="text-green-700 hover:text-green-900 text-sm font-medium"
                actionLabel="Xem tất cả"
                href="/products"
                solid={false}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
              {products.slice(0, 8).map((p) => (
                <ProductCard key={p.id} product={p} onQuickView={onQuickView} />
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-14">
            {categories.map(([cat, items]) => (
              <div key={cat}>
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <h3 className="landing-heading text-xl font-bold capitalize text-green-900 not-italic">
                    {cat}
                  </h3>
                  <SectionTitleLinkButton
                    buttonClassName="text-green-700 hover:text-green-900 text-sm font-medium"
                    actionLabel="Xem tất cả"
                    href={`/products?category=${encodeURIComponent(cat)}`}
                    solid={false}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
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
