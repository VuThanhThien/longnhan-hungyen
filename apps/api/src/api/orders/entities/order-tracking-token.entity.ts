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
  UpdateDateColumn,
} from 'typeorm';
import { OrderEntity } from './order.entity';

@Entity('order_tracking_token')
@Index('IDX_order_tracking_token_hash', ['tokenHash'])
@Index('IDX_order_tracking_token_order_id', ['orderId'])
export class OrderTrackingTokenEntity {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_order_tracking_token_id',
  })
  id!: Uuid;

  @Column({ type: 'uuid' })
  orderId!: Uuid;

  @Column({ type: 'varchar', length: 64, unique: true })
  tokenHash!: string; // sha256 hex

  @Column({ type: 'timestamptz' })
  expiresAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  usedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => OrderEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order!: Relation<OrderEntity>;
}
