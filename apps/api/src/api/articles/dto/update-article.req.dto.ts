import { BooleanFieldOptional, StringFieldOptional } from '@/decorators/field.decorators';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateArticleReqDto {
  @StringFieldOptional({ maxLength: 255 })
  title?: string;

  @StringFieldOptional()
  excerpt?: string;

  @StringFieldOptional()
  contentHtml?: string;

  @StringFieldOptional({ maxLength: 255 })
  featuredImageUrl?: string;

  @StringFieldOptional({ maxLength: 255 })
  metaTitle?: string;

  @StringFieldOptional()
  metaDescription?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @BooleanFieldOptional()
  published?: boolean;
}
