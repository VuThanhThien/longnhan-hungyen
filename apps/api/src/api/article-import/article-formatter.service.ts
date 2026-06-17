import { AllConfigType } from '@/config/config.type';
import {
  BadGatewayException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { CrawlResult } from './types/crawl-result.type';
import { truncateForLlm } from './utils/truncate-for-llm.util';

export type FormattedArticle = {
  title: string;
  excerpt: string;
  contentHtml: string;
  featuredImageUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  tags?: string[];
};

type OpenAiArticleJson = {
  title?: string;
  excerpt?: string;
  contentHtml?: string;
  featuredImageUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  tags?: string[];
};

const SYSTEM_PROMPT = `Bạn là biên tập viên cho blog Long Nhãn — thương hiệu nhãn lồng long nhãn Tống Trân Hưng Yên.

Nhiệm vụ: viết lại nội dung bài viết bằng tiếng Việt tự nhiên, phù hợp độc giả quan tâm đến ẩm thực và nông sản của thương hiệu Long Nhãn Tống Trân Hưng Yên.

Quy tắc:
- Chỉ lấy những nội dung chính, bỏ qua những thông tin quảng cáo thừa.
- Giữ nguyên sự kiện, số liệu, tên riêng, địa danh; không bịa thêm thông tin sản phẩm.
- contentHtml: HTML ngữ nghĩa cho trình soạn thảo Tiptap, chỉ dùng thẻ h2, p, ul, strong — không html/body/script/style inline.
- excerpt: tối đa 300 ký tự.
- tags: 3–8 từ khóa liên quan.
- Nếu nguồn đã là tiếng Việt, vẫn chuẩn hóa giọng văn và cấu trúc.

Trả về JSON với các trường: title, excerpt, contentHtml, metaTitle, metaDescription, tags, featuredImageUrl.`;

@Injectable()
export class ArticleFormatterService {
  private readonly logger = new Logger(ArticleFormatterService.name);

  constructor(private readonly configService: ConfigService<AllConfigType>) {}

  async format(
    sourceUrl: string,
    crawl: CrawlResult,
  ): Promise<FormattedArticle> {
    const apiKey = this.configService.get('articleImport.openaiApiKey', {
      infer: true,
    });

    if (!apiKey) {
      throw new ServiceUnavailableException(
        'Chức năng nhập URL chưa được cấu hình',
      );
    }

    const model = this.configService.get('articleImport.openaiModel', {
      infer: true,
    })!;

    const markdown = truncateForLlm(crawl.markdown);
    const userPrompt = [
      `URL nguồn: ${sourceUrl}`,
      crawl.title ? `Tiêu đề gốc: ${crawl.title}` : null,
      crawl.metadata?.ogImage
        ? `Ảnh đại diện gốc (og:image): ${crawl.metadata.ogImage}`
        : null,
      '',
      'Nội dung markdown:',
      markdown,
    ]
      .filter(Boolean)
      .join('\n');

    try {
      const client = new OpenAI({ apiKey });
      const completion = await client.chat.completions.create({
        model,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
      });

      const raw = completion.choices[0]?.message?.content;
      if (!raw) {
        throw new BadGatewayException('Không thể định dạng nội dung');
      }

      const parsed = JSON.parse(raw) as OpenAiArticleJson;

      if (!parsed.title || !parsed.excerpt || !parsed.contentHtml) {
        throw new BadGatewayException('Không thể định dạng nội dung');
      }

      return {
        title: parsed.title,
        excerpt: parsed.excerpt.slice(0, 300),
        contentHtml: parsed.contentHtml,
        featuredImageUrl:
          parsed.featuredImageUrl ?? crawl.metadata?.ogImage ?? undefined,
        metaTitle: parsed.metaTitle,
        metaDescription: parsed.metaDescription,
        tags: parsed.tags,
      };
    } catch (error) {
      if (
        error instanceof BadGatewayException ||
        error instanceof ServiceUnavailableException
      ) {
        throw error;
      }

      this.logger.error('OpenAI formatting failed', error);
      throw new BadGatewayException('Không thể định dạng nội dung');
    }
  }
}
