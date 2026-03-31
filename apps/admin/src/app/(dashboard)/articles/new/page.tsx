import { redirect } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArticleForm } from '@/components/articles/article-form';
import { adminFetch } from '@/lib/admin-api-client';
import { parseArticlePayload } from '@/lib/admin-form-parsers';

export default function ArticleCreatePage() {
  async function createArticleAction(formData: FormData) {
    'use server';
    const payload = parseArticlePayload(formData);
    await adminFetch('/articles', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    redirect('/articles');
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header title="Tạo bài viết" />
      <main className="flex-1 overflow-y-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nội dung bài viết</CardTitle>
          </CardHeader>
          <CardContent>
            <ArticleForm action={createArticleAction} submitLabel="Tạo bài viết" />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
