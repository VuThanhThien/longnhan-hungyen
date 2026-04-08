'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArticleForm } from '@/components/articles/article-form';
import { parseArticlePayload } from '@/lib/admin-form-parsers';
import { adminClientPost } from '@/lib/admin-client';

export default function ArticleCreatePage() {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const payload = parseArticlePayload(formData);
      await adminClientPost('/articles', payload);
    },
    onSuccess: () => {
      toast.success('Đã tạo bài viết');
      router.push('/articles');
      router.refresh();
    },
    onError: () => {
      toast.error('Tạo bài viết thất bại');
    },
  });

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header title="Tạo bài viết" />
      <main className="flex-1 overflow-y-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nội dung bài viết</CardTitle>
          </CardHeader>
          <CardContent>
            <ArticleForm
              onSubmit={(formData) => mutation.mutateAsync(formData)}
              isSubmitting={mutation.isPending}
              submitLabel="Tạo bài viết"
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
