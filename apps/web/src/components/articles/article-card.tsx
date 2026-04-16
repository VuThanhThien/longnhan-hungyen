// Article card — cover image, title, summary, date for article list page

import Link from 'next/link';
import Image from 'next/image';
import type { Article } from '@longnhan/types';

interface ArticleCardProps {
  article: Article;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const publishedDate = article.publishedAt ?? article.createdAt;
  const coverImage = article.featuredImageUrl ?? article.coverImageUrl;
  const excerpt = article.excerpt ?? article.summary;

  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
    >
      <div className="relative aspect-video bg-gray-100 overflow-hidden">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={article.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-5xl text-gray-300">
            📰
          </div>
        )}
      </div>
      <div className="p-4">
        <time className="text-xs text-gray-400 mb-1 block">
          {formatDate(publishedDate)}
        </time>
        <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-2 line-clamp-2 group-hover:text-foreground transition-colors">
          {article.title}
        </h3>
        {excerpt && (
          <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
            {excerpt}
          </p>
        )}
      </div>
    </Link>
  );
}
