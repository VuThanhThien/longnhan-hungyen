import { Uuid } from '@/common/types/common.type';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { ProductVariantEntity } from '../../products/entities/product-variant.entity';
import { OrderEntity } from './order.entity';

@Entity('order_item')
export class OrderItemEntity {
  constructor(data?: Partial<OrderItemEntity>) {
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_order_item_id',
  })
  id!: Uuid;

  /**
   * Snapshot of variant data at order time.
   * Prevents data loss when variant is edited or deleted after order placed.
   */
  @Column({ type: 'jsonb' })
  variantSnapshot!: Record<string, unknown>;

  @Column({ type: 'int' })
  qty!: number;

  @Column({ type: 'int' })
  unitPrice!: number; // VND

  @Column({ type: 'int' })
  subtotal!: number; // qty * unitPrice

  // FK column for order relation
  @Column({ type: 'uuid', name: 'order_id' })
  @Index('IDX_order_item_order_id')
  orderId!: Uuid;

  @ManyToOne(() => OrderEntity, (o) => o.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Relation<OrderEntity>;

  // FK column for variant — nullable since variant may be deleted later
  @Column({ type: 'uuid', name: 'variant_id', nullable: true })
  variantId: Uuid | null;

  @ManyToOne(() => ProductVariantEntity, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'variant_id' })
  variant: Relation<ProductVariantEntity> | null;
}
