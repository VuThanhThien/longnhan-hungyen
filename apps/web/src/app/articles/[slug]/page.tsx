import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { Article } from '@longnhan/types';
import ArticleContent from '@/components/articles/article-content';
import Breadcrumb from '@/components/ui/breadcrumb';
import { fetchApi, fetchPaginated } from '@/lib/api-client';
import { SITE_URL } from '@/lib/constants';
import { buildArticleSchema, buildBreadcrumbSchema } from '@/lib/structured-data';

export const revalidate = 3600;

interface ArticleDetailPageProps {
  params: Promise<{ slug: string }>;
}

async function getArticle(slug: string): Promise<Article | null> {
  try {
    return await fetchApi<Article>(`/articles/${slug}`);
  } catch {
    return null;
  }
}

export async function generateStaticParams() {
  try {
    const response = await fetchPaginated<Article>('/articles', { limit: 200 });
    return response.data.map((article) => ({ slug: article.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: ArticleDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return { title: 'Khong tim thay bai viet' };
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

export default async function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  const articleSchema = buildArticleSchema(article);
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Trang chu', url: SITE_URL },
    { name: 'Tin tuc', url: `${SITE_URL}/articles` },
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
          { label: 'Trang chu', url: '/' },
          { label: 'Tin tuc', url: '/articles' },
          { label: article.title },
        ]}
      />
      <ArticleContent article={article} />
    </section>
  );
}
