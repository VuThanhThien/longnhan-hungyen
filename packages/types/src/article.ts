export enum ArticleStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  contentHtml: string | null;
  featuredImageUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  tags: string[];
  status: ArticleStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  // Backward-compatible aliases for old consumers.
  summary?: string | null;
  content?: string;
  coverImageUrl?: string | null;
}

export interface CreateArticleDto {
  title: string;
  slug: string;
  excerpt?: string;
  contentHtml?: string;
  featuredImageUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  tags?: string[];
  status?: ArticleStatus;
  publishedAt?: string;
}

export interface UpdateArticleDto extends Partial<CreateArticleDto> {}
