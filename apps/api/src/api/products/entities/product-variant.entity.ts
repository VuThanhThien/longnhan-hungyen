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
import { ProductEntity } from './product.entity';

@Entity('product_variant')
export class ProductVariantEntity {
  constructor(data?: Partial<ProductVariantEntity>) {
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_product_variant_id',
  })
  id!: Uuid;

  @Column({ length: 100 })
  label!: string; // e.g. "500g", "1kg", "Hộp 1kg"

  @Column({ type: 'int', nullable: true })
  weightG: number | null; // grams

  @Column({ type: 'int' })
  price!: number; // VND integer

  @Column({ type: 'int', default: 0 })
  stock!: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  skuCode: string | null;

  @Column({ default: true })
  active!: boolean;

  @Column({ type: 'int', default: 0 })
  sortOrder!: number;

  // FK column — also serves as the join column for the relation
  @Column({ type: 'uuid', name: 'product_id' })
  @Index('IDX_product_variant_product_id')
  productId!: Uuid;

  @ManyToOne(() => ProductEntity, (p) => p.variants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Relation<ProductEntity>;
}
