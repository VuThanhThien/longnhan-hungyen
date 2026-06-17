export interface ArticleImportCrawlMeta {
  crawledAt: string;
  loadTimeMs: number;
  sourceTitle?: string;
}

export interface ArticleImportPreview {
  sourceUrl: string;
  title: string;
  excerpt: string;
  contentHtml: string;
  featuredImageUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  tags?: string[];
  crawlMeta: ArticleImportCrawlMeta;
}

export interface ArticleImportPreviewRequest {
  url: string;
}
