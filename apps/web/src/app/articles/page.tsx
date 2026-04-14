import type { Metadata } from 'next';
import type { Article } from '@longnhan/types';
import ArticleCard from '@/components/articles/article-card';
import Breadcrumb from '@/components/ui/breadcrumb';
import { fetchPaginated } from '@/lib/api-client';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Tin tuc ve long nhan Hung Yen',
    description: 'Kien thuc, kinh nghiem va cau chuyen ve long nhan Hung Yen.',
  };
}

export default async function ArticlesPage() {
  let articles: Article[] = [];
  try {
    const response = await fetchPaginated<Article>('/articles', { limit: 24 });
    articles = response.data;
  } catch {
    articles = [];
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <Breadcrumb
        items={[{ label: 'Trang chủ', url: '/' }, { label: 'Tin tuc' }]}
      />
      <h1 className="text-2xl md:text-3xl font-bold text-green-950 mb-6">
        Tin tuc
      </h1>
      {articles.length === 0 ? (
        <p className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-600">
          Chua co bai viet nao.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </section>
  );
}
