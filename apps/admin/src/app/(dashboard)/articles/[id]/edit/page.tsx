'use client';

import { ArticleForm } from '@/components/articles/article-form';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { adminClientGet, adminClientPut } from '@/lib/admin-client';
import { adminQueryKeys } from '@/lib/query-keys';
import { parseArticlePayload } from '@/lib/admin-form-parsers';
import type { Article } from '@longnhan/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';

const ARTICLE_EDIT_FORM_ID = 'article-edit-main-form';

export default function ArticleEditPage() {
  const queryClient = useQueryClient();
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
    onSuccess: async () => {
      toast.success('Đã cập nhật bài viết');
      await queryClient.invalidateQueries({
        queryKey: adminQueryKeys.articles.root,
      });
      queryClient.invalidateQueries({ queryKey: ['articles', 'admin', id] });
    },
    onError: () => {
      toast.error('Cập nhật bài viết thất bại');
    },
  });

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header title={article ? `Sửa: ${article.title}` : 'Sửa bài viết'} />
      <main className="flex min-h-0 flex-1 flex-col">
        {isLoading ? (
          <div className="p-6 text-sm text-muted-foreground">Đang tải…</div>
        ) : null}
        {isError ? (
          <div className="p-6 text-sm text-destructive">
            Không tìm thấy bài viết
          </div>
        ) : null}

        {article ? (
          <>
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border bg-popover px-6 py-3">
              <p className="text-sm text-muted-foreground">Cập nhật bài viết</p>
              <div className="flex shrink-0 items-center gap-2">
                <Button
                  type="submit"
                  form={ARTICLE_EDIT_FORM_ID}
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? 'Đang lưu…' : 'Lưu thay đổi'}
                </Button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4 lg:p-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Nội dung bài viết</CardTitle>
                </CardHeader>
                <CardContent>
                  <ArticleForm
                    formId={ARTICLE_EDIT_FORM_ID}
                    hideSubmitButton
                    initialArticle={article}
                    onSubmit={(formData) => mutation.mutateAsync(formData)}
                    isSubmitting={mutation.isPending}
                    submitLabel="Lưu thay đổi"
                  />
                </CardContent>
              </Card>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
