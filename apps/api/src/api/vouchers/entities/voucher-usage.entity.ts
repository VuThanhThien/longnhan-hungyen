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
} from 'typeorm';
import { OrderEntity } from '../../orders/entities/order.entity';
import { VoucherEntity } from './voucher.entity';

@Entity('voucher_usage')
@Index('UQ_voucher_usage_voucher_phone', ['voucherId', 'phone'], {
  unique: true,
})
export class VoucherUsageEntity {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_voucher_usage_id',
  })
  id!: Uuid;

  @Column({ type: 'uuid' })
  voucherId!: Uuid;

  @Column({ type: 'uuid' })
  orderId!: Uuid;

  @Column({ length: 20 })
  phone!: string;

  /** VND amount actually deducted */
  @Column({ type: 'int' })
  discountAmount!: number;

  @CreateDateColumn({ name: 'used_at', type: 'timestamptz' })
  usedAt!: Date;

  @ManyToOne(() => VoucherEntity, (v) => v.usages)
  @JoinColumn({ name: 'voucherId' })
  voucher: Relation<VoucherEntity>;

  @ManyToOne(() => OrderEntity)
  @JoinColumn({ name: 'orderId' })
  order: Relation<OrderEntity>;
}
