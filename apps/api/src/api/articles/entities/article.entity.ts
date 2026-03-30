import { Uuid } from '@/common/types/common.type';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ArticleStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

@Entity('article')
export class ArticleEntity {
  constructor(data?: Partial<ArticleEntity>) {
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'PK_article_id' })
  id!: Uuid;

  @Column({ length: 255 })
  title!: string;

  @Column({ length: 255, unique: true })
  @Index('UQ_article_slug', { unique: true })
  slug!: string;

  @Column({ type: 'text', nullable: true })
  excerpt: string | null; // Short summary for SEO / article cards

  @Column({ type: 'text' })
  contentHtml!: string; // Tiptap-generated HTML

  @Column({ type: 'varchar', length: 255, nullable: true })
  featuredImageUrl: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  metaTitle: string | null;

  @Column({ type: 'text', nullable: true })
  metaDescription: string | null;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ type: 'enum', enum: ArticleStatus, default: ArticleStatus.DRAFT })
  @Index('IDX_article_status')
  status!: ArticleStatus;

  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
