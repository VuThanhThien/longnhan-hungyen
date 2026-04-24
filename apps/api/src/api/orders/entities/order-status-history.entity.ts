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
import { UserEntity } from '../../user/entities/user.entity';
import { OrderEntity, OrderStatus } from './order.entity';

export enum OrderStatusHistoryActor {
  SYSTEM = 'system',
  ADMIN = 'admin',
  CUSTOMER = 'customer',
}

@Entity('order_status_history')
@Index('IDX_order_status_history_order_created', ['orderId', 'createdAt'])
export class OrderStatusHistoryEntity {
  constructor(data?: Partial<OrderStatusHistoryEntity>) {
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_order_status_history_id',
  })
  id!: Uuid;

  @Column({ name: 'order_id', type: 'uuid' })
  orderId!: Uuid;

  @ManyToOne(() => OrderEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order!: Relation<OrderEntity>;

  @Column({
    name: 'from_status',
    type: 'enum',
    enum: OrderStatus,
    nullable: true,
  })
  fromStatus: OrderStatus | null;

  @Column({ name: 'to_status', type: 'enum', enum: OrderStatus })
  toStatus!: OrderStatus;

  @Column({
    name: 'actor_type',
    type: 'enum',
    enum: OrderStatusHistoryActor,
  })
  actorType!: OrderStatusHistoryActor;

  @Column({ name: 'actor_id', type: 'uuid', nullable: true })
  actorId: Uuid | null;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'actor_id' })
  actor: Relation<UserEntity> | null;

  @Column({ type: 'text', nullable: true })
  note: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
