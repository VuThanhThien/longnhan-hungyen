import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { Article } from '@longnhan/types';
import ArticleContent from '@/components/articles/article-content';
import Breadcrumb from '@/components/ui/breadcrumb';
import { fetchApi } from '@/lib/api-client';
import { captureApiFetchError } from '@/lib/observability/api-fetch-sentry';
import { buildBreadcrumb } from '@/lib/breadcrumb';
import { articleDetailCacheTags } from '@/lib/content-cache-tags';
import { buildSeoMetadata } from '@/lib/seo';
import { buildArticleSchema } from '@/lib/structured-data';
import { cacheLife, cacheTag } from 'next/cache';

interface ArticleDetailPageProps {
  params: Promise<{ slug: string }>;
}

async function getArticle(slug: string): Promise<Article | null> {
  'use cache';
  cacheLife({ revalidate: 3600 });
  cacheTag(...articleDetailCacheTags(slug));
  try {
    return await fetchApi<Article>(`/articles/${slug}`);
  } catch (error) {
    captureApiFetchError(error, {
      route: '/articles/[slug]',
      section: 'article_detail',
      extra: { slug },
    });
    return null;
  }
}

export async function generateMetadata({
  params,
}: ArticleDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return { title: 'Không tìm thấy bài viết' };
  }

  const title = article.metaTitle ?? article.title;
  const description = article.metaDescription ?? article.excerpt ?? undefined;
  const image = article.featuredImageUrl ?? article.coverImageUrl ?? undefined;

  return buildSeoMetadata({
    title,
    description,
    canonicalPath: `/articles/${article.slug}`,
    openGraphType: 'article',
    ...(image ? { ogImage: { url: image, alt: title } } : {}),
  });
}

export default async function ArticleDetailPage({
  params,
}: ArticleDetailPageProps) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  const articleSchema = buildArticleSchema(article);
  const breadcrumbItems = [
    { label: 'Trang chủ', url: '/' },
    { label: 'Bài viết', url: '/articles' },
    { label: article.title },
  ];
  const { schema: breadcrumbSchema } = buildBreadcrumb({
    items: breadcrumbItems,
    currentUrl: `/articles/${article.slug}`,
  });

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {breadcrumbSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      ) : null}

      <Breadcrumb items={breadcrumbItems} />
      <ArticleContent article={article} />
    </section>
  );
}
