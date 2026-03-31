'use client';

import { useState } from 'react';
import type { Article } from '@longnhan/types';
import { MediaUrlPicker } from '@/components/media/media-url-picker';
import { TiptapHtmlEditor } from '@/components/articles/tiptap-html-editor';

interface ArticleFormProps {
  initialArticle?: Article;
  submitLabel: string;
  action: (formData: FormData) => void | Promise<void>;
}

export function ArticleForm({ initialArticle, submitLabel, action }: ArticleFormProps) {
  const [featuredImageUrl, setFeaturedImageUrl] = useState(initialArticle?.featuredImageUrl || '');
  const [contentHtml, setContentHtml] = useState(initialArticle?.contentHtml || '<p></p>');

  return (
    <form action={action} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm text-gray-600">Tiêu đề</label>
          <input
            name="title"
            defaultValue={initialArticle?.title || ''}
            required
            className="h-10 w-full rounded-md border border-gray-200 px-3 text-sm"
          />
        </div>
        <div className="flex items-end">
          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" name="published" defaultChecked={initialArticle?.status === 'published'} />
            Xuất bản ngay
          </label>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm text-gray-600">Mô tả ngắn</label>
        <textarea
          name="excerpt"
          rows={3}
          defaultValue={initialArticle?.excerpt || ''}
          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm text-gray-600">Nội dung (Tiptap)</label>
        <TiptapHtmlEditor value={contentHtml} onChange={setContentHtml} />
        <input type="hidden" name="contentHtml" value={contentHtml} />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-gray-600">Ảnh đại diện bài viết</label>
        <MediaUrlPicker value={featuredImageUrl} onChange={setFeaturedImageUrl} folder="articles" />
        <input type="hidden" name="featuredImageUrl" value={featuredImageUrl} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm text-gray-600">Meta title</label>
          <input
            name="metaTitle"
            defaultValue={initialArticle?.metaTitle || ''}
            className="h-10 w-full rounded-md border border-gray-200 px-3 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-gray-600">Tags (phân tách bằng dấu phẩy)</label>
          <input
            name="tags"
            defaultValue={initialArticle?.tags?.join(', ') || ''}
            className="h-10 w-full rounded-md border border-gray-200 px-3 text-sm"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm text-gray-600">Meta description</label>
        <textarea
          name="metaDescription"
          rows={3}
          defaultValue={initialArticle?.metaDescription || ''}
          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
        />
      </div>

      <button type="submit" className="inline-flex h-10 items-center rounded-md bg-green-600 px-4 text-sm font-medium text-white hover:bg-green-700">
        {submitLabel}
      </button>
    </form>
  );
}
