import articleImportConfig from '@/api/article-import/config/article-import.config';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ArticleFormatterService } from './article-formatter.service';
import { ArticleImportController } from './article-import.controller';
import { ArticleImportService } from './article-import.service';
import { CrawlService } from './crawl.service';

@Module({
  imports: [ConfigModule.forFeature(articleImportConfig)],
  controllers: [ArticleImportController],
  providers: [ArticleImportService, CrawlService, ArticleFormatterService],
})
export class ArticleImportModule {}
