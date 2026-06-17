import { registerAs } from '@nestjs/config';
import { ArticleImportConfig } from './article-import-config.type';

export default registerAs<ArticleImportConfig>('articleImport', () => ({
  firecrawlApiKey: process.env.FIRECRAWL_API_KEY ?? '',
  openaiApiKey: process.env.OPENAI_API_KEY ?? '',
  openaiModel: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
  timeoutMs: Number(process.env.ARTICLE_IMPORT_TIMEOUT_MS ?? 90_000),
}));
