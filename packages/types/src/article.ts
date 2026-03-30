export enum ArticleStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  coverImageUrl: string | null;
  status: ArticleStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateArticleDto {
  title: string;
  slug: string;
  summary?: string;
  content: string;
  coverImageUrl?: string;
  status?: ArticleStatus;
  publishedAt?: string;
}

export interface UpdateArticleDto extends Partial<CreateArticleDto> {}
