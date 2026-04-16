// Article full content renderer — dangerouslySetInnerHTML for Tiptap HTML output
// Tiptap HTML styles: global `article-tiptap-content.css` (imported in app/globals.css)

import Image from 'next/image';
import type { Article } from '@longnhan/types';

interface ArticleContentProps {
  article: Article;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export default function ArticleContent({ article }: ArticleContentProps) {
  const publishedDate = article.publishedAt ?? article.createdAt;
  const coverImage = article.featuredImageUrl ?? article.coverImageUrl;
  const excerpt = article.excerpt ?? article.summary;
  const htmlContent = article.contentHtml ?? article.content ?? '';

  return (
    <article className="max-w-3xl mx-auto">
      {coverImage && (
        <div className="relative aspect-video rounded-xl overflow-hidden mb-8">
          <Image
            src={coverImage}
            alt={article.title}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Meta */}
      <time className="text-sm text-gray-400 block mb-3">
        {formatDate(publishedDate)}
      </time>

      {/* Title */}
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-4">
        {article.title}
      </h1>

      {/* Summary */}
      {excerpt && (
        <p className="text-lg text-gray-600 leading-relaxed border-l-4 border-green-500 pl-4 mb-8">
          {excerpt}
        </p>
      )}

      {/* HTML content from Tiptap — classes match admin editor for shared CSS */}
      <div
        className="article-body tiptap ProseMirror simple-editor"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </article>
  );
}
