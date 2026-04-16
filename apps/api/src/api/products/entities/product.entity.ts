import { CategoryEntity } from '@/api/categories/entities/category.entity';
import { Uuid } from '@/common/types/common.type';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { ProductVariantEntity } from './product-variant.entity';

@Entity('product')
export class ProductEntity {
  constructor(data?: Partial<ProductEntity>) {
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'PK_product_id' })
  id!: Uuid;

  @Column({ length: 255 })
  name!: string;

  @Column({ length: 255, unique: true })
  @Index('UQ_product_slug', { unique: true })
  slug!: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'text', nullable: true })
  summary: string | null;

  @Column({ type: 'text', nullable: true })
  descriptionHtml: string | null;

  @Column({ type: 'int', default: 0 })
  basePrice!: number; // VND integer

  @Column({ type: 'simple-array', nullable: true })
  images: string[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  featuredImageUrl: string | null;

  @Column({ length: 50, default: 'other' })
  category!: string;

  @Column({ name: 'category_id', type: 'uuid', nullable: true })
  @Index('IDX_product_category_id')
  categoryId!: string | null;

  @ManyToOne(() => CategoryEntity, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'category_id' })
  categoryRef?: Relation<CategoryEntity>;

  @Column({ type: 'varchar', length: 255, nullable: true })
  videoUrl: string | null;

  @Column({ default: true })
  @Index('IDX_product_active')
  active!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(() => ProductVariantEntity, (v) => v.product, { cascade: true })
  variants: Relation<ProductVariantEntity[]>;
}
