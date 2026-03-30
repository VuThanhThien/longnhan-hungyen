import { BooleanFieldOptional, StringField, StringFieldOptional } from '@/decorators/field.decorators';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateArticleReqDto {
  @StringField({ maxLength: 255 })
  title!: string;

  @StringFieldOptional()
  excerpt?: string;

  @StringField()
  contentHtml!: string;

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

  /** Publish immediately if true */
  @BooleanFieldOptional()
  published?: boolean;
}
