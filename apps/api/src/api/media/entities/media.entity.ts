import { Uuid } from '@/common/types/common.type';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum MediaResourceType {
  IMAGE = 'image',
  VIDEO = 'video',
  RAW = 'raw',
}

@Entity('media')
export class MediaEntity {
  constructor(data?: Partial<MediaEntity>) {
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'PK_media_id' })
  id!: Uuid;

  @Column({ length: 255 })
  cloudinaryPublicId!: string; // Cloudinary public_id for deletion/transforms

  @Column({ length: 1000 })
  url!: string; // Cloudinary delivery URL

  @Column({ type: 'varchar', length: 255, nullable: true })
  filename: string | null;

  @Column({ type: 'enum', enum: MediaResourceType, default: MediaResourceType.IMAGE })
  resourceType!: MediaResourceType;

  @Column({ type: 'varchar', length: 100, nullable: true })
  folder: string | null; // Cloudinary folder (products, articles, etc.)

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
