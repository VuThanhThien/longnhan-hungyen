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
import { VoucherEntity } from '../../vouchers/entities/voucher.entity';
import { OrderItemEntity } from './order-item.entity';

export enum PaymentMethod {
  COD = 'cod',
  BANK_TRANSFER = 'bank_transfer',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  SHIPPING = 'shipping',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

@Entity('order')
@Index('IDX_order_created_at', ['createdAt'])
export class OrderEntity {
  constructor(data?: Partial<OrderEntity>) {
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'PK_order_id' })
  id!: Uuid;

  @Column({ length: 20, unique: true })
  @Index('UQ_order_code', { unique: true })
  code!: string; // e.g. LN-260329-1234

  @Column({ length: 100 })
  customerName!: string;

  @Column({ length: 20 })
  phone!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;

  @Column({ type: 'text' })
  address!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  province: string | null;

  @Column({ type: 'int' })
  total!: number; // VND integer

  @Column({ type: 'int', default: 0 })
  discountAmount!: number; // VND deducted; 0 if no voucher

  @Column({ type: 'varchar', length: 50, nullable: true })
  voucherCode: string | null; // snapshot of code used

  @Column({ name: 'voucher_id', type: 'uuid', nullable: true })
  @Index('IDX_order_voucher_id')
  voucherId: Uuid | null;

  @ManyToOne(() => VoucherEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'voucher_id' })
  voucher: Relation<VoucherEntity> | null;

  @Column({ type: 'enum', enum: PaymentMethod, default: PaymentMethod.COD })
  paymentMethod!: PaymentMethod;

  @Column({
    name: 'sepay_transaction_id',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  @Index('UQ_order_sepay_transaction_id', { unique: true })
  sepayTransactionId: string | null;

  @Column({ name: 'sepay_paid_at', type: 'timestamptz', nullable: true })
  sepayPaidAt: Date | null;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  @Index('IDX_order_payment_status')
  paymentStatus!: PaymentStatus;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  @Index('IDX_order_status')
  orderStatus!: OrderStatus;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(() => OrderItemEntity, (i) => i.order, { cascade: true })
  items: Relation<OrderItemEntity[]>;
}
