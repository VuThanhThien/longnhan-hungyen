import { notFound, redirect } from 'next/navigation';
import type { Article } from '@longnhan/types';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArticleForm } from '@/components/articles/article-form';
import { adminFetch } from '@/lib/admin-api-client';
import { parseArticlePayload } from '@/lib/admin-form-parsers';

interface ArticleEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function ArticleEditPage({ params }: ArticleEditPageProps) {
  const { id } = await params;
  const article = await adminFetch<Article>(`/articles/admin/${id}`).catch(() => null);
  if (!article) notFound();

  async function updateArticleAction(formData: FormData) {
    'use server';
    const payload = parseArticlePayload(formData);
    await adminFetch(`/articles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    redirect('/articles');
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header title={`Sửa: ${article.title}`} />
      <main className="flex-1 overflow-y-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cập nhật bài viết</CardTitle>
          </CardHeader>
          <CardContent>
            <ArticleForm initialArticle={article} action={updateArticleAction} submitLabel="Lưu thay đổi" />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
