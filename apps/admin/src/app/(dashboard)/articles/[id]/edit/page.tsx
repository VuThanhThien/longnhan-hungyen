'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Article } from '@longnhan/types';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArticleForm } from '@/components/articles/article-form';
import { parseArticlePayload } from '@/lib/admin-form-parsers';
import { adminClientGet, adminClientPut } from '@/lib/admin-client';

export default function ArticleEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const {
    data: article,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['articles', 'admin', id],
    enabled: Boolean(id),
    queryFn: () => adminClientGet<Article>(`/articles/admin/${id}`),
  });

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      if (!id) return;
      const payload = parseArticlePayload(formData);
      await adminClientPut(`/articles/${id}`, payload);
    },
    onSuccess: () => {
      toast.success('Đã cập nhật bài viết');
      router.push('/articles');
      router.refresh();
    },
    onError: () => {
      toast.error('Cập nhật bài viết thất bại');
    },
  });

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header title={article ? `Sửa: ${article.title}` : 'Sửa bài viết'} />
      <main className="flex-1 overflow-y-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cập nhật bài viết</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 text-sm text-gray-500">Đang tải…</div>
            ) : null}
            {isError ? (
              <div className="py-8 text-sm text-red-600">
                Không tìm thấy bài viết
              </div>
            ) : null}
            {article ? (
              <ArticleForm
                initialArticle={article}
                onSubmit={(formData) => mutation.mutateAsync(formData)}
                isSubmitting={mutation.isPending}
                submitLabel="Lưu thay đổi"
              />
            ) : null}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
