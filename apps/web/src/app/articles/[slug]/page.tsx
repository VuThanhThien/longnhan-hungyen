import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { Article } from '@longnhan/types';
import ArticleContent from '@/components/articles/article-content';
import Breadcrumb from '@/components/ui/breadcrumb';
import { fetchApi } from '@/lib/api-client';
import { SITE_URL } from '@/lib/constants';
import {
  buildArticleSchema,
  buildBreadcrumbSchema,
} from '@/lib/structured-data';
import { cacheLife, cacheTag } from 'next/cache';

interface ArticleDetailPageProps {
  params: Promise<{ slug: string }>;
}

async function getArticle(slug: string): Promise<Article | null> {
  'use cache';
  cacheLife({ revalidate: 3600 });
  cacheTag('articles', `article-${slug}`);
  try {
    return await fetchApi<Article>(`/articles/${slug}`);
  } catch {
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

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
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
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Trang chủ', url: SITE_URL },
    { name: 'Bài viết', url: `${SITE_URL}/articles` },
    { name: article.title, url: `${SITE_URL}/articles/${article.slug}` },
  ]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <Breadcrumb
        items={[
          { label: 'Trang chủ', url: '/' },
          { label: 'Bài viết', url: '/articles' },
          { label: article.title },
        ]}
      />
      <ArticleContent article={article} />
    </section>
  );
}
