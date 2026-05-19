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
import { OrderEntity } from '../../orders/entities/order.entity';
import { UserEntity } from '../../user/entities/user.entity';

export enum TransactionType {
  PAYMENT = 'payment',
  REFUND = 'refund',
  ADJUSTMENT = 'adjustment',
  FEE = 'fee',
}

export enum TransactionMethod {
  COD = 'cod',
  BANK_TRANSFER = 'bank_transfer',
  CASH = 'cash',
  OTHER = 'other',
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  VOIDED = 'voided',
}

export enum TransactionDirection {
  IN = 'in',
  OUT = 'out',
}

@Entity('transaction')
@Index('IDX_transaction_order_occurred', ['orderId', 'occurredAt'])
@Index('IDX_transaction_order_type_status', ['orderId', 'type', 'status'])
@Index('IDX_transaction_type', ['type'])
@Index('IDX_transaction_status', ['status'])
@Index('IDX_transaction_method', ['method'])
@Index('IDX_transaction_occurred', ['occurredAt'])
export class TransactionEntity {
  constructor(data?: Partial<TransactionEntity>) {
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_transaction_id',
  })
  id!: Uuid;

  @Column({ name: 'order_id', type: 'uuid' })
  orderId!: Uuid;

  @ManyToOne(() => OrderEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'order_id' })
  order!: Relation<OrderEntity>;

  @Column({ type: 'enum', enum: TransactionType })
  type!: TransactionType;

  @Column({ type: 'enum', enum: TransactionMethod, nullable: true })
  method: TransactionMethod | null;

  @Column({ type: 'int' })
  amount!: number;

  @Column({ type: 'enum', enum: TransactionDirection })
  direction!: TransactionDirection;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.COMPLETED,
  })
  status!: TransactionStatus;

  @Column({
    name: 'reference_no',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  referenceNo: string | null;

  @Column({ name: 'reference_note', type: 'text', nullable: true })
  referenceNote: string | null;

  @Column({ name: 'occurred_at', type: 'timestamptz' })
  occurredAt!: Date;

  @Column({ name: 'created_by_admin_id', type: 'uuid', nullable: true })
  createdByAdminId: Uuid | null;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by_admin_id' })
  createdByAdmin: Relation<UserEntity> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
