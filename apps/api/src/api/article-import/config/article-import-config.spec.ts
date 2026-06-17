import articleImportConfig from './article-import.config';

describe('ArticleImportConfig', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  it('returns defaults when env vars are not set', async () => {
    delete process.env.FIRECRAWL_API_KEY;
    delete process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_MODEL;
    delete process.env.ARTICLE_IMPORT_TIMEOUT_MS;

    const config = await articleImportConfig();

    expect(config.firecrawlApiKey).toBe('');
    expect(config.openaiApiKey).toBe('');
    expect(config.openaiModel).toBe('gpt-4o-mini');
    expect(config.timeoutMs).toBe(90_000);
  });

  it('reads values from environment variables', async () => {
    process.env.FIRECRAWL_API_KEY = 'fc-key';
    process.env.OPENAI_API_KEY = 'oa-key';
    process.env.OPENAI_MODEL = 'gpt-4o';
    process.env.ARTICLE_IMPORT_TIMEOUT_MS = '120000';

    const config = await articleImportConfig();

    expect(config.firecrawlApiKey).toBe('fc-key');
    expect(config.openaiApiKey).toBe('oa-key');
    expect(config.openaiModel).toBe('gpt-4o');
    expect(config.timeoutMs).toBe(120_000);
  });
});
