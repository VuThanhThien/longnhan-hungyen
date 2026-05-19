import { Uuid } from '@/common/types/common.type';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { VoucherUsageEntity } from './voucher-usage.entity';

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

@Entity('voucher')
@Index('IDX_voucher_created_at', ['createdAt'])
export class VoucherEntity {
  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'PK_voucher_id' })
  id!: Uuid;

  @Column({ length: 50 })
  @Index('UQ_voucher_code', { unique: true })
  code!: string; // always stored uppercase

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string | null;

  @Column({ type: 'enum', enum: DiscountType })
  discountType!: DiscountType;

  /** Percent (1-100) or VND amount */
  @Column({ type: 'int' })
  discountValue!: number;

  @Column({ type: 'int', nullable: true })
  minOrderAmount: number | null;

  /** null = unlimited */
  @Column({ type: 'int', nullable: true })
  maxUses: number | null;

  @Column({ type: 'int', default: 0 })
  usedCount!: number;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  expiresAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(() => VoucherUsageEntity, (u) => u.voucher)
  usages: Relation<VoucherUsageEntity[]>;
}
