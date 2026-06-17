'use client';

import type { ArticleImportPreview } from '@longnhan/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const crawlSchema = z.object({
  url: z.string().trim().url('URL không hợp lệ').min(1, 'Vui lòng nhập URL'),
});

type CrawlFormValues = z.infer<typeof crawlSchema>;

interface ArticleCrawlPanelProps {
  onImportSuccess: (preview: ArticleImportPreview) => void;
  disabled?: boolean;
}

export function ArticleCrawlPanel({
  onImportSuccess,
  disabled = false,
}: ArticleCrawlPanelProps) {
  const form = useForm<CrawlFormValues>({
    resolver: zodResolver(crawlSchema),
    defaultValues: { url: '' },
  });

  const mutation = useMutation({
    mutationFn: async (url: string) => {
      const res = await fetch('/api/article-import/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as {
          message?: string;
        };
        throw new Error(err.message || 'Nhập nội dung thất bại');
      }

      return res.json() as Promise<ArticleImportPreview>;
    },
    onSuccess: (data) => {
      toast.success('Đã nhập nội dung — vui lòng kiểm tra trước khi lưu');
      onImportSuccess(data);
      form.reset();
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const isPending = mutation.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Nhập từ URL</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="flex flex-col gap-4 sm:flex-row sm:items-end"
            onSubmit={form.handleSubmit((values) =>
              mutation.mutate(values.url),
            )}
          >
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>URL bài viết</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="url"
                      placeholder="https://..."
                      disabled={disabled || isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={disabled || isPending}
              className="sm:mb-0.5"
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Nhập nội dung
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
