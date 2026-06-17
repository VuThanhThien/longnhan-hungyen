'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Article } from '@longnhan/types';
import type { ArticleImportPreview } from '@longnhan/types';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArticleCrawlPanel } from '@/components/articles/article-crawl-panel';
import { ArticleForm } from '@/components/articles/article-form';
import { parseArticlePayload } from '@/lib/admin-form-parsers';
import { mapPreviewToArticle } from '@/lib/article-import-mappers';
import { adminClientPost } from '@/lib/admin-client';
import { adminQueryKeys } from '@/lib/query-keys';

export default function ArticleCreatePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formKey, setFormKey] = useState(0);
  const [prefill, setPrefill] = useState<ArticleImportPreview | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const payload = parseArticlePayload(formData);
      await adminClientPost('/articles', payload);
    },
    onSuccess: async () => {
      toast.success('Đã tạo bài viết');
      await queryClient.invalidateQueries({
        queryKey: adminQueryKeys.articles.root,
      });
      router.push('/articles');
    },
    onError: () => {
      toast.error('Tạo bài viết thất bại');
    },
  });

  const initialArticle = prefill
    ? (mapPreviewToArticle(prefill) as Article)
    : undefined;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header title="Tạo bài viết" />
      <main className="flex-1 overflow-y-auto p-4 lg:p-6">
        <div className="space-y-4">
          <ArticleCrawlPanel
            disabled={mutation.isPending}
            onImportSuccess={(preview) => {
              setPrefill(preview);
              setSourceUrl(preview.sourceUrl);
              setFormKey((key) => key + 1);
              document
                .getElementById('article-form')
                ?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
          {sourceUrl ? (
            <p className="text-sm text-muted-foreground">Nguồn: {sourceUrl}</p>
          ) : null}
          <Card id="article-form">
            <CardHeader>
              <CardTitle className="text-base">Nội dung bài viết</CardTitle>
            </CardHeader>
            <CardContent>
              <ArticleForm
                key={formKey}
                initialArticle={initialArticle}
                onSubmit={(formData) => mutation.mutateAsync(formData)}
                isSubmitting={mutation.isPending}
                submitLabel="Tạo bài viết"
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
