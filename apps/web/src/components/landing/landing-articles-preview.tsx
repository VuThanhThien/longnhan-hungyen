// Articles preview section — up to 3 latest articles on landing page
import Link from 'next/link';
import Image from 'next/image';
import type { Article } from '@longnhan/types';
import SectionTitleLinkButton from '@/components/ui/section-title-link-button';

interface LandingArticlesPreviewProps {
  articles: Article[];
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function LandingArticlesPreview({
  articles,
}: LandingArticlesPreviewProps) {
  if (articles.length === 0) return null;

  return (
    <section className="bg-(--brand-cream) px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <SectionTitleLinkButton
          className="mb-8"
          titleClassName="text-2xl font-semibold text-(--brand-forest) not-italic"
          buttonClassName="text-sm font-medium text-(--brand-leaf) hover:text-(--brand-forest)"
          title="Tin tức & chia sẻ"
          actionLabel="Xem tất cả"
          href="/articles"
          align="right"
          solid={false}
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {articles.map((article) => {
            const cover = article.featuredImageUrl ?? article.coverImageUrl;
            return (
              <Link
                key={article.id}
                href={`/articles/${article.slug}`}
                className="group overflow-hidden rounded-xl border border-(--brand-forest)/10 bg-white shadow-sm transition hover:shadow-md"
              >
                {cover ? (
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={cover}
                      alt={article.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-(--brand-gold)/10 flex items-center justify-center text-4xl">
                    🌿
                  </div>
                )}
                <div className="p-4">
                  <p className="mb-1 text-xs text-(--brand-forest-muted)">
                    {formatDate(article.publishedAt)}
                  </p>
                  <h3 className="line-clamp-2 text-sm font-semibold text-(--brand-forest) leading-snug">
                    {article.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-(--brand-leaf) font-medium">
                    Đọc thêm
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
