'use client';

import { useMemo } from 'react';
import type { Article } from '@longnhan/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useForm, type Resolver } from 'react-hook-form';
import { z } from 'zod';
import { TiptapHtmlEditor } from '@/components/articles/tiptap-html-editor';
import { MediaUrlPicker } from '@/components/media/media-url-picker';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface ArticleFormProps {
  initialArticle?: Article;
  submitLabel: string;
  onSubmit: (formData: FormData) => void | Promise<void>;
  isSubmitting?: boolean;
  formId?: string;
  hideSubmitButton?: boolean;
}

const articleFormSchema = z.object({
  title: z.string().trim().min(1, 'Vui lòng nhập tiêu đề'),
  excerpt: z.string().trim().optional(),
  published: z.boolean().default(false),
  contentHtml: z.string().trim().min(1, 'Vui lòng nhập nội dung'),
  featuredImageUrl: z.string().trim().optional(),
  metaTitle: z.string().trim().optional(),
  tags: z.string().trim().optional(),
  metaDescription: z.string().trim().optional(),
});

type ArticleFormValues = z.infer<typeof articleFormSchema>;

export function ArticleForm({
  initialArticle,
  submitLabel,
  onSubmit,
  isSubmitting,
  formId,
  hideSubmitButton = false,
}: ArticleFormProps) {
  const initialTags = useMemo(
    () => initialArticle?.tags?.join(', ') || '',
    [initialArticle?.tags],
  );

  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(
      articleFormSchema,
    ) as unknown as Resolver<ArticleFormValues>,
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    defaultValues: {
      title: initialArticle?.title ?? '',
      excerpt: initialArticle?.excerpt ?? '',
      published: initialArticle?.status === 'published',
      contentHtml: initialArticle?.contentHtml ?? '<p></p>',
      featuredImageUrl: initialArticle?.featuredImageUrl ?? '',
      metaTitle: initialArticle?.metaTitle ?? '',
      tags: initialTags,
      metaDescription: initialArticle?.metaDescription ?? '',
    },
  });

  const submitting = isSubmitting ?? form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form
        id={formId}
        className="space-y-5"
        onSubmit={form.handleSubmit(async (data) => {
          const formData = new FormData();
          formData.set('title', data.title);
          formData.set('excerpt', data.excerpt || '');
          if (data.published) formData.set('published', 'on');
          formData.set('contentHtml', data.contentHtml || '');
          formData.set('featuredImageUrl', data.featuredImageUrl || '');
          formData.set('metaTitle', data.metaTitle || '');
          formData.set('tags', data.tags || '');
          formData.set('metaDescription', data.metaDescription || '');
          await onSubmit(formData);
        })}
      >
        <Accordion
          type="single"
          collapsible
          defaultValue="basic"
          className="w-full rounded-lg border border-border px-4"
        >
          <AccordionItem value="basic">
            <AccordionTrigger>Thông tin chính</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tiêu đề</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="VD: Cách chọn long nhãn ngon"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="published"
                  render={({ field }) => (
                    <FormItem className="flex h-9 mt-2 items-end">
                      <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(next: boolean | 'indeterminate') =>
                            field.onChange(Boolean(next))
                          }
                        />
                        <span>Xuất bản ngay</span>
                      </label>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="excerpt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả ngắn</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ?? ''}
                        rows={3}
                        placeholder="Tóm tắt ngắn cho bài viết…"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="content">
            <AccordionTrigger>Nội dung</AccordionTrigger>
            <AccordionContent className="space-y-1">
              <FormField
                control={form.control}
                name="contentHtml"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Nội dung bài viết</FormLabel>
                    <FormControl>
                      <TiptapHtmlEditor
                        value={field.value ?? '<p></p>'}
                        onChange={field.onChange}
                        placeholder="Viết nội dung… Gõ / để chèn khối."
                        className="rounded-md border border-border"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="media">
            <AccordionTrigger>Ảnh đại diện</AccordionTrigger>
            <AccordionContent className="space-y-2">
              <FormField
                control={form.control}
                name="featuredImageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">
                      Ảnh đại diện bài viết
                    </FormLabel>
                    <FormControl>
                      <MediaUrlPicker
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        folder="articles"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="seo">
            <AccordionTrigger>SEO & thẻ</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="metaTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta title</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags (phân tách bằng dấu phẩy)</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="metaDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta description</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value ?? ''} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {hideSubmitButton ? null : (
          <Button type="submit" disabled={submitting} className="w-fit">
            {submitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {submitting ? 'Đang lưu…' : submitLabel}
          </Button>
        )}
      </form>
    </Form>
  );
}
