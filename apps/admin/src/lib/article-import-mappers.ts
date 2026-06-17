import type { Article, ArticleImportPreview } from '@longnhan/types';
import { ArticleStatus } from '@longnhan/types';

export function mapPreviewToArticle(
  preview: ArticleImportPreview,
): Partial<Article> {
  return {
    title: preview.title,
    excerpt: preview.excerpt,
    contentHtml: preview.contentHtml,
    featuredImageUrl: preview.featuredImageUrl ?? null,
    metaTitle: preview.metaTitle ?? null,
    metaDescription: preview.metaDescription ?? null,
    tags: preview.tags ?? [],
    status: ArticleStatus.DRAFT,
  };
}
