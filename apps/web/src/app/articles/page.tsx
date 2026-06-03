import type { Metadata } from 'next';
import { ArticlesListingContent } from '@/components/articles/articles-listing-content';
import Breadcrumb from '@/components/ui/breadcrumb';
import { ArticlesListingSkeleton } from '@/components/ui/route-loading-skeleton';
import { ARTICLES_LISTING_SEO } from '@/data/landing-page-content';
import { buildBreadcrumb } from '@/lib/breadcrumb';
import { buildSeoMetadata } from '@/lib/seo';
import { PWA_CONFIG } from '@/lib/pwa-config';
import { connection } from 'next/server';
import { Suspense } from 'react';

export async function generateMetadata(): Promise<Metadata> {
  return buildSeoMetadata({
    title: ARTICLES_LISTING_SEO.title,
    description: ARTICLES_LISTING_SEO.description,
    canonicalPath: '/articles',
    ogImage: {
      url: PWA_CONFIG.heroImage.path,
      width: PWA_CONFIG.heroImage.width,
      height: PWA_CONFIG.heroImage.height,
      alt: PWA_CONFIG.heroImage.alt,
    },
  });
}

export default async function ArticlesPage() {
  await connection();

  const breadcrumbItems = [
    { label: 'Trang chủ', url: '/' },
    { label: 'Bài viết' },
  ];
  const { schema: breadcrumbSchema } = buildBreadcrumb({
    items: breadcrumbItems,
    currentUrl: '/articles',
  });

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      {breadcrumbSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      ) : null}
      <Breadcrumb items={breadcrumbItems} />
      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
        Bài viết
      </h1>
      <Suspense fallback={<ArticlesListingSkeleton />}>
        <ArticlesListingContent />
      </Suspense>
    </section>
  );
}
