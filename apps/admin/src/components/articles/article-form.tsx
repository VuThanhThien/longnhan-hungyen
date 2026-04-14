'use client';

import { useEffect, useState } from 'react';
import type { Article } from '@longnhan/types';
import { MediaUrlPicker } from '@/components/media/media-url-picker';
import { TiptapHtmlEditor } from '@/components/articles/tiptap-html-editor';
import { useForm, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

interface ArticleFormProps {
  initialArticle?: Article;
  submitLabel: string;
  onSubmit: (formData: FormData) => void | Promise<void>;
  isSubmitting?: boolean;
}

const articleFormSchema = yup.object({
  title: yup.string().trim().required('Vui lòng nhập tiêu đề'),
  excerpt: yup.string().trim().optional(),
  published: yup.boolean().default(false),
  contentHtml: yup.string().trim().required('Vui lòng nhập nội dung'),
  featuredImageUrl: yup.string().trim().optional(),
  metaTitle: yup.string().trim().optional(),
  tags: yup.string().trim().optional(),
  metaDescription: yup.string().trim().optional(),
});

type ArticleFormValues = yup.InferType<typeof articleFormSchema>;

export function ArticleForm({
  initialArticle,
  submitLabel,
  onSubmit,
  isSubmitting,
}: ArticleFormProps) {
  const [featuredImageUrl, setFeaturedImageUrl] = useState(
    initialArticle?.featuredImageUrl || '',
  );
  const [contentHtml, setContentHtml] = useState(
    initialArticle?.contentHtml || '<p></p>',
  );

  return (
    <ArticleFormInner
      initialArticle={initialArticle}
      submitLabel={submitLabel}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      featuredImageUrl={featuredImageUrl}
      setFeaturedImageUrl={setFeaturedImageUrl}
      contentHtml={contentHtml}
      setContentHtml={setContentHtml}
    />
  );
}

interface ArticleFormInnerProps extends ArticleFormProps {
  featuredImageUrl: string;
  setFeaturedImageUrl: (value: string) => void;
  contentHtml: string;
  setContentHtml: (value: string) => void;
}

function ArticleFormInner({
  initialArticle,
  submitLabel,
  onSubmit,
  isSubmitting,
  featuredImageUrl,
  setFeaturedImageUrl,
  contentHtml,
  setContentHtml,
}: ArticleFormInnerProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ArticleFormValues>({
    resolver: yupResolver(
      articleFormSchema,
    ) as unknown as Resolver<ArticleFormValues>,
    defaultValues: {
      title: initialArticle?.title || '',
      excerpt: initialArticle?.excerpt || '',
      published: initialArticle?.status === 'published',
      contentHtml,
      featuredImageUrl,
      metaTitle: initialArticle?.metaTitle || '',
      tags: initialArticle?.tags?.join(', ') || '',
      metaDescription: initialArticle?.metaDescription || '',
    },
  });

  useEffect(() => {
    setValue('featuredImageUrl', featuredImageUrl, { shouldValidate: true });
  }, [featuredImageUrl, setValue]);

  useEffect(() => {
    setValue('contentHtml', contentHtml, { shouldValidate: true });
  }, [contentHtml, setValue]);

  return (
    <form
      className="space-y-6"
      onSubmit={handleSubmit(async (data: ArticleFormValues) => {
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm text-gray-600">Tiêu đề</label>
          <input
            {...register('title')}
            required
            className="h-10 w-full rounded-md border border-gray-200 px-3 text-sm"
          />
          {errors.title?.message ? (
            <p className="text-xs text-red-600">{errors.title.message}</p>
          ) : null}
        </div>
        <div className="flex items-end">
          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" {...register('published')} />
            Xuất bản ngay
          </label>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm text-gray-600">Mô tả ngắn</label>
        <textarea
          rows={3}
          {...register('excerpt')}
          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm text-gray-600">Nội dung (Tiptap)</label>
        <TiptapHtmlEditor value={contentHtml} onChange={setContentHtml} />
        {errors.contentHtml?.message ? (
          <p className="text-xs text-red-600">{errors.contentHtml.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm text-gray-600">Ảnh đại diện bài viết</label>
        <MediaUrlPicker
          value={featuredImageUrl}
          onChange={setFeaturedImageUrl}
          folder="articles"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm text-gray-600">Meta title</label>
          <input
            {...register('metaTitle')}
            className="h-10 w-full rounded-md border border-gray-200 px-3 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-gray-600">
            Tags (phân tách bằng dấu phẩy)
          </label>
          <input
            {...register('tags')}
            className="h-10 w-full rounded-md border border-gray-200 px-3 text-sm"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm text-gray-600">Meta description</label>
        <textarea
          rows={3}
          {...register('metaDescription')}
          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
        />
      </div>

      <input type="hidden" {...register('contentHtml')} />
      <input type="hidden" {...register('featuredImageUrl')} />

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex h-10 items-center rounded-md bg-green-600 px-4 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
      >
        {isSubmitting ? 'Đang lưu…' : submitLabel}
      </button>
    </form>
  );
}
