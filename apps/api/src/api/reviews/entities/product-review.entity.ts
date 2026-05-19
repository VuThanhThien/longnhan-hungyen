import { OrderEntity } from '@/api/orders/entities/order.entity';
import { ProductEntity } from '@/api/products/entities/product.entity';
import { Uuid } from '@/common/types/common.type';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

export enum ProductReviewStatus {
  PENDING = 'pending',
  PUBLISHED = 'published',
  REJECTED = 'rejected',
}

@Entity('product_review')
@Unique('UQ_product_review_order_product', ['orderId', 'productId'])
@Index('IDX_product_review_product_status_created_at', [
  'productId',
  'status',
  'createdAt',
])
@Index('IDX_product_review_status_created_at', ['status', 'createdAt'])
export class ProductReviewEntity {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_product_review_id',
  })
  id!: Uuid;

  @Column({ type: 'uuid', name: 'product_id' })
  productId!: Uuid;

  @Column({ type: 'uuid', name: 'order_id' })
  orderId!: Uuid;

  @Column({ type: 'smallint' })
  rating!: number; // 1..5

  @Column({ type: 'text', nullable: true })
  comment: string | null;

  @Column({ name: 'is_anonymous', type: 'boolean', default: false })
  isAnonymous!: boolean;

  @Column({
    name: 'variant_label_snapshot',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  variantLabelSnapshot: string | null;

  @Column({
    name: 'public_reviewer_label',
    type: 'varchar',
    length: 120,
    nullable: true,
  })
  publicReviewerLabel: string | null;

  @Column({
    type: 'enum',
    enum: ProductReviewStatus,
    default: ProductReviewStatus.PENDING,
  })
  status!: ProductReviewStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => ProductEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product!: Relation<ProductEntity>;

  @ManyToOne(() => OrderEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order!: Relation<OrderEntity>;
}
