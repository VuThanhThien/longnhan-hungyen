export type CrawlResult = {
  title?: string;
  markdown: string;
  html?: string;
  metadata?: {
    ogImage?: string;
  };
};
