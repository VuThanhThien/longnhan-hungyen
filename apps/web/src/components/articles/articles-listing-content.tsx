import type { Article } from '@longnhan/types';
import ArticleCard from '@/components/articles/article-card';
import { fetchPaginated } from '@/lib/api-client';
import { captureApiFetchError } from '@/lib/observability/api-fetch-sentry';

async function getArticles(): Promise<Article[]> {
  try {
    const response = await fetchPaginated<Article>('/articles', { limit: 24 });
    return response.data;
  } catch (error) {
    captureApiFetchError(error, {
      route: '/articles',
      section: 'listing',
    });
    return [];
  }
}

export async function ArticlesListingContent() {
  const articles = await getArticles();

  if (articles.length === 0) {
    return (
      <p className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-600">
        Chưa có bài viết nào.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}
